import { EmailProvider, EmailData, EmailResult, DeliveryStatus, EmailEvent, ProviderConfig } from './types'
import crypto from 'crypto'

export class MailgunProvider extends EmailProvider {
  private baseUrl: string
  private apiKey: string
  private domain: string
  private webhookSecret?: string

  constructor(config: ProviderConfig) {
    super(config)
    this.apiKey = config.apiKey || process.env.MAILGUN_API_KEY || ''
    this.domain = config.domain || process.env.MAILGUN_DOMAIN || ''
    this.webhookSecret = config.webhookSecret || process.env.MAILGUN_WEBHOOK_SECRET
    this.baseUrl = config.baseUrl || `https://api.mailgun.net/v3/${this.domain}`
  }

  async validateConfig(): Promise<boolean> {
    if (!this.apiKey || !this.domain) {
      console.error('Mailgun: Missing API key or domain')
      return false
    }

    try {
      const response = await fetch(`${this.baseUrl}/stats/total`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${this.apiKey}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      })

      return response.ok
    } catch (error) {
      console.error('Mailgun: Configuration validation failed:', error)
      return false
    }
  }

  async sendEmail(email: EmailData): Promise<EmailResult> {
    const startTime = Date.now()

    try {
      if (!this.canSendEmail()) {
        throw new Error('Provider cannot send email (disabled, unhealthy, or quota exceeded)')
      }

      const formData = new FormData()
      
      // Recipients
      const toAddresses = Array.isArray(email.to) ? email.to : [email.to]
      toAddresses.forEach(to => formData.append('to', to))
      
      if (email.cc) {
        const ccAddresses = Array.isArray(email.cc) ? email.cc : [email.cc]
        ccAddresses.forEach(cc => formData.append('cc', cc))
      }
      
      if (email.bcc) {
        const bccAddresses = Array.isArray(email.bcc) ? email.bcc : [email.bcc]
        bccAddresses.forEach(bcc => formData.append('bcc', bcc))
      }

      // Content
      formData.append('from', process.env.EMAIL_FROM_ADDRESS || 'noreply@institute.edu')
      formData.append('subject', email.subject)
      
      if (email.html) {
        formData.append('html', email.html)
      }
      
      if (email.text) {
        formData.append('text', email.text)
      } else if (email.html) {
        // Generate text version from HTML
        const textContent = email.html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
        formData.append('text', textContent)
      }

      // Options
      if (email.tags && email.tags.length > 0) {
        email.tags.forEach(tag => formData.append('o:tag', tag))
      }

      if (email.metadata) {
        Object.entries(email.metadata).forEach(([key, value]) => {
          formData.append(`v:${key}`, String(value))
        })
      }

      // Tracking
      formData.append('o:tracking', 'true')
      formData.append('o:tracking-clicks', 'true')
      formData.append('o:tracking-opens', 'true')

      // Attachments
      if (email.attachments && email.attachments.length > 0) {
        email.attachments.forEach((attachment, index) => {
          const blob = new Blob([attachment.content], { 
            type: attachment.contentType || 'application/octet-stream' 
          })
          formData.append('attachment', blob, attachment.filename)
        })
      }

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${this.apiKey}`).toString('base64')}`
        },
        body: formData
      })

      const responseData = await response.json()
      const deliveryTime = Date.now() - startTime

      if (response.ok) {
        const result: EmailResult = {
          success: true,
          messageId: responseData.id,
          providerId: responseData.id,
          provider: 'mailgun',
          deliveryTime,
          metadata: responseData
        }

        this.updateStats(result)
        return result
      } else {
        throw new Error(responseData.message || 'Mailgun API error')
      }

    } catch (error) {
      const deliveryTime = Date.now() - startTime
      const result: EmailResult = {
        success: false,
        provider: 'mailgun',
        error: error instanceof Error ? error.message : 'Unknown error',
        deliveryTime
      }

      this.updateStats(result)
      throw error
    }
  }

  async getDeliveryStatus(messageId: string): Promise<DeliveryStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/events`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${this.apiKey}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch delivery status')
      }

      const data = await response.json()
      const events = data.items || []
      
      // Find the latest event for this message
      const messageEvents = events.filter((event: any) => 
        event.message && event.message.headers && 
        event.message.headers['message-id'] === messageId
      )

      if (messageEvents.length === 0) {
        return {
          messageId,
          status: 'pending',
          timestamp: new Date()
        }
      }

      const latestEvent = messageEvents[0]
      
      return {
        messageId,
        status: this.mapMailgunEventToStatus(latestEvent.event),
        timestamp: new Date(latestEvent.timestamp * 1000),
        description: latestEvent.reason || latestEvent.description,
        metadata: latestEvent
      }

    } catch (error) {
      console.error('Mailgun: Failed to get delivery status:', error)
      throw error
    }
  }

  async handleWebhook(payload: any, signature?: string): Promise<EmailEvent[]> {
    try {
      // Verify webhook signature if secret is configured
      if (this.webhookSecret && signature) {
        const isValid = this.verifyWebhookSignature(payload, signature)
        if (!isValid) {
          throw new Error('Invalid webhook signature')
        }
      }

      const events: EmailEvent[] = []
      
      // Handle single event or batch of events
      const eventData = payload['event-data'] || payload
      
      if (Array.isArray(eventData)) {
        // Batch of events
        for (const event of eventData) {
          const emailEvent = this.parseMailgunEvent(event)
          if (emailEvent) {
            events.push(emailEvent)
          }
        }
      } else {
        // Single event
        const emailEvent = this.parseMailgunEvent(eventData)
        if (emailEvent) {
          events.push(emailEvent)
        }
      }

      return events

    } catch (error) {
      console.error('Mailgun: Webhook handling failed:', error)
      throw error
    }
  }

  private verifyWebhookSignature(payload: any, signature: string): boolean {
    if (!this.webhookSecret) return true

    try {
      const timestamp = payload.timestamp
      const token = payload.token
      
      const data = timestamp + token
      const hash = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(data)
        .digest('hex')

      return hash === signature
    } catch (error) {
      console.error('Mailgun: Signature verification failed:', error)
      return false
    }
  }

  private parseMailgunEvent(eventData: any): EmailEvent | null {
    try {
      if (!eventData.event || !eventData.message) {
        return null
      }

      return {
        messageId: eventData.message.headers['message-id'] || eventData.id,
        event: this.mapMailgunEventToEmailEvent(eventData.event),
        timestamp: new Date(eventData.timestamp * 1000),
        recipient: eventData.recipient,
        metadata: eventData
      }
    } catch (error) {
      console.error('Mailgun: Failed to parse event:', error)
      return null
    }
  }

  private mapMailgunEventToStatus(event: string): DeliveryStatus['status'] {
    switch (event) {
      case 'delivered':
        return 'delivered'
      case 'failed':
      case 'rejected':
        return 'failed'
      case 'bounced':
        return 'bounced'
      case 'complained':
        return 'complained'
      case 'opened':
        return 'opened'
      case 'clicked':
        return 'clicked'
      default:
        return 'pending'
    }
  }

  private mapMailgunEventToEmailEvent(event: string): EmailEvent['event'] {
    switch (event) {
      case 'delivered':
        return 'delivered'
      case 'opened':
        return 'opened'
      case 'clicked':
        return 'clicked'
      case 'bounced':
        return 'bounced'
      case 'complained':
        return 'complained'
      case 'unsubscribed':
        return 'unsubscribed'
      default:
        return 'delivered'
    }
  }
}
