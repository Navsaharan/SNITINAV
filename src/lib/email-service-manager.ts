import { EmailProvider, EmailData, EmailResult, DeliveryStatus, EmailEvent, ProviderConfig, ProviderStats } from './email-providers/types'
import { MailgunProvider } from './email-providers/mailgun'
import { prisma } from './prisma'

export interface EmailServiceConfig {
  providers: ProviderConfig[]
  fallbackEnabled: boolean
  retryAttempts: number
  retryDelay: number
  defaultProvider?: string
}

export class EmailServiceManager {
  private providers: Map<string, EmailProvider> = new Map()
  private config: EmailServiceConfig
  private isInitialized = false

  constructor(config?: EmailServiceConfig) {
    this.config = config || this.getDefaultConfig()
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Initialize providers based on configuration
      for (const providerConfig of this.config.providers) {
        const provider = this.createProvider(providerConfig)
        
        if (provider) {
          // Validate provider configuration
          const isValid = await provider.validateConfig()
          
          if (isValid) {
            this.providers.set(providerConfig.name, provider)
            console.log(`Email provider ${providerConfig.name} initialized successfully`)
          } else {
            console.warn(`Email provider ${providerConfig.name} configuration invalid`)
          }
        }
      }

      if (this.providers.size === 0) {
        throw new Error('No email providers could be initialized')
      }

      this.isInitialized = true
      console.log(`Email service initialized with ${this.providers.size} providers`)

    } catch (error) {
      console.error('Failed to initialize email service:', error)
      throw error
    }
  }

  async sendEmail(email: EmailData): Promise<EmailResult> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const providers = this.getAvailableProviders()
    
    if (providers.length === 0) {
      throw new Error('No email providers available')
    }

    let lastError: Error | null = null

    // Try providers in priority order
    for (const provider of providers) {
      try {
        console.log(`Attempting to send email via ${provider.getName()}`)
        
        const result = await provider.sendEmail(email)
        
        // Log successful send
        await this.logEmailSend(email, result)
        
        console.log(`Email sent successfully via ${provider.getName()}`)
        return result

      } catch (error) {
        lastError = error as Error
        console.warn(`Email send failed via ${provider.getName()}:`, error)
        
        // Mark provider as unhealthy if it's consistently failing
        if (this.shouldMarkUnhealthy(provider, error as Error)) {
          provider.markUnhealthy()
          console.warn(`Marked provider ${provider.getName()} as unhealthy`)
        }

        // Continue to next provider if fallback is enabled
        if (!this.config.fallbackEnabled) {
          break
        }
      }
    }

    // All providers failed
    const errorMessage = lastError?.message || 'All email providers failed'
    
    // Log failed send attempt
    await this.logEmailSend(email, {
      success: false,
      provider: 'none',
      error: errorMessage
    })

    throw new Error(errorMessage)
  }

  async getDeliveryStatus(messageId: string, provider?: string): Promise<DeliveryStatus> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    if (provider) {
      const emailProvider = this.providers.get(provider)
      if (emailProvider) {
        return await emailProvider.getDeliveryStatus(messageId)
      }
      throw new Error(`Provider ${provider} not found`)
    }

    // Try all providers to find the message
    for (const [, emailProvider] of this.providers) {
      try {
        return await emailProvider.getDeliveryStatus(messageId)
      } catch (error) {
        // Continue to next provider
        continue
      }
    }

    throw new Error('Message not found in any provider')
  }

  async handleWebhook(provider: string, payload: any, signature?: string): Promise<EmailEvent[]> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const emailProvider = this.providers.get(provider)
    if (!emailProvider) {
      throw new Error(`Provider ${provider} not found`)
    }

    const events = await emailProvider.handleWebhook(payload, signature)
    
    // Process events (update database, trigger notifications, etc.)
    await this.processEmailEvents(events)
    
    return events
  }

  getProviderStats(): Record<string, ProviderStats> {
    const stats: Record<string, ProviderStats> = {}
    
    for (const [name, provider] of this.providers) {
      stats[name] = provider.getStats()
    }
    
    return stats
  }

  getAvailableProviders(): EmailProvider[] {
    return Array.from(this.providers.values())
      .filter(provider => provider.canSendEmail())
      .sort((a, b) => a.getPriority() - b.getPriority())
  }

  async resetProviderHealth(providerName: string): Promise<void> {
    const provider = this.providers.get(providerName)
    if (provider) {
      provider.markHealthy()
      console.log(`Reset health status for provider ${providerName}`)
    }
  }

  private createProvider(config: ProviderConfig): EmailProvider | null {
    switch (config.name.toLowerCase()) {
      case 'mailgun':
        return new MailgunProvider(config)
      
      // Add other providers here
      // case 'sendgrid':
      //   return new SendGridProvider(config)
      // case 'ses':
      //   return new SESProvider(config)
      
      default:
        console.warn(`Unknown email provider: ${config.name}`)
        return null
    }
  }

  private getDefaultConfig(): EmailServiceConfig {
    return {
      providers: [
        {
          name: 'mailgun',
          enabled: !!process.env.MAILGUN_API_KEY,
          priority: 1,
          dailyLimit: 1000,
          monthlyLimit: 1000,
          apiKey: process.env.MAILGUN_API_KEY,
          domain: process.env.MAILGUN_DOMAIN,
          webhookSecret: process.env.MAILGUN_WEBHOOK_SECRET
        }
      ],
      fallbackEnabled: true,
      retryAttempts: 3,
      retryDelay: 5000,
      defaultProvider: 'mailgun'
    }
  }

  private shouldMarkUnhealthy(provider: EmailProvider, error: Error): boolean {
    // Mark unhealthy for specific error types
    const unhealthyErrors = [
      'authentication failed',
      'invalid api key',
      'quota exceeded',
      'rate limit exceeded'
    ]

    const errorMessage = error.message.toLowerCase()
    return unhealthyErrors.some(pattern => errorMessage.includes(pattern))
  }

  private async logEmailSend(email: EmailData, result: EmailResult): Promise<void> {
    try {
      // Log to database for analytics and debugging
      await prisma.emailQueue.create({
        data: {
          id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          toEmail: Array.isArray(email.to) ? email.to.join(',') : email.to,
          subject: email.subject,
          htmlContent: email.html || '',
          textContent: email.text || '',
          status: result.success ? 'sent' : 'failed',
          provider: result.provider,
          attempts: 1,
          sentAt: result.success ? new Date() : null,
          errorMessage: result.error || null
        }
      })
    } catch (error) {
      console.error('Failed to log email send:', error)
      // Don't throw - logging failure shouldn't break email sending
    }
  }

  private async processEmailEvents(events: EmailEvent[]): Promise<void> {
    for (const event of events) {
      try {
        // Update email status in database
        await prisma.email.updateMany({
          where: {
            messageId: event.messageId
          },
          data: {
            status: this.mapEventToEmailStatus(event.event),
            deliveredAt: event.event === 'delivered' ? event.timestamp : undefined,
            readAt: event.event === 'opened' ? event.timestamp : undefined
          }
        })

        // Trigger additional processing based on event type
        await this.handleEmailEvent(event)

      } catch (error) {
        console.error('Failed to process email event:', error)
        // Continue processing other events
      }
    }
  }

  private mapEventToEmailStatus(event: EmailEvent['event']): string {
    switch (event) {
      case 'delivered':
        return 'DELIVERED'
      case 'bounced':
        return 'BOUNCED'
      case 'complained':
        return 'FAILED'
      default:
        return 'SENT'
    }
  }

  private async handleEmailEvent(event: EmailEvent): Promise<void> {
    switch (event.event) {
      case 'bounced':
        // Handle bounced emails (maybe disable recipient)
        console.log(`Email bounced for recipient: ${event.recipient}`)
        break
      
      case 'complained':
        // Handle spam complaints (definitely disable recipient)
        console.log(`Spam complaint from recipient: ${event.recipient}`)
        break
      
      case 'unsubscribed':
        // Handle unsubscribes
        console.log(`Unsubscribe from recipient: ${event.recipient}`)
        break
      
      default:
        // Log other events for analytics
        console.log(`Email event ${event.event} for recipient: ${event.recipient}`)
    }
  }
}

// Singleton instance
let emailServiceManager: EmailServiceManager | null = null

export function getEmailServiceManager(): EmailServiceManager {
  if (!emailServiceManager) {
    emailServiceManager = new EmailServiceManager()
  }
  return emailServiceManager
}
