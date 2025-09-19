// Email provider interfaces and types

export interface EmailData {
  to: string | string[]
  cc?: string | string[]
  bcc?: string | string[]
  subject: string
  html?: string
  text?: string
  attachments?: EmailAttachment[]
  template?: string
  templateData?: Record<string, any>
  priority?: number
  scheduledAt?: Date
  tags?: string[]
  metadata?: Record<string, any>
}

export interface EmailAttachment {
  filename: string
  content: Buffer | string
  contentType?: string
  disposition?: 'attachment' | 'inline'
  contentId?: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  providerId?: string
  provider: string
  error?: string
  deliveryTime?: number
  metadata?: Record<string, any>
}

export interface DeliveryStatus {
  messageId: string
  status: 'pending' | 'delivered' | 'failed' | 'bounced' | 'complained' | 'opened' | 'clicked'
  timestamp: Date
  description?: string
  metadata?: Record<string, any>
}

export interface EmailEvent {
  messageId: string
  event: 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed'
  timestamp: Date
  recipient: string
  metadata?: Record<string, any>
}

export interface ProviderConfig {
  name: string
  enabled: boolean
  priority: number
  dailyLimit: number
  monthlyLimit: number
  apiKey?: string
  apiSecret?: string
  domain?: string
  webhookSecret?: string
  baseUrl?: string
  timeout?: number
}

export interface ProviderStats {
  provider: string
  sent: number
  delivered: number
  failed: number
  bounced: number
  complained: number
  dailyUsage: number
  monthlyUsage: number
  lastUsed?: Date
  isHealthy: boolean
  averageDeliveryTime: number
}

export abstract class EmailProvider {
  protected config: ProviderConfig
  protected stats: ProviderStats

  constructor(config: ProviderConfig) {
    this.config = config
    this.stats = {
      provider: config.name,
      sent: 0,
      delivered: 0,
      failed: 0,
      bounced: 0,
      complained: 0,
      dailyUsage: 0,
      monthlyUsage: 0,
      isHealthy: true,
      averageDeliveryTime: 0
    }
  }

  abstract sendEmail(email: EmailData): Promise<EmailResult>
  abstract getDeliveryStatus(messageId: string): Promise<DeliveryStatus>
  abstract handleWebhook(payload: any, signature?: string): Promise<EmailEvent[]>
  abstract validateConfig(): Promise<boolean>

  // Common methods
  getName(): string {
    return this.config.name
  }

  isEnabled(): boolean {
    return this.config.enabled
  }

  getPriority(): number {
    return this.config.priority
  }

  getStats(): ProviderStats {
    return { ...this.stats }
  }

  canSendEmail(): boolean {
    if (!this.config.enabled || !this.stats.isHealthy) {
      return false
    }

    // Check daily limit
    if (this.stats.dailyUsage >= this.config.dailyLimit) {
      return false
    }

    // Check monthly limit
    if (this.stats.monthlyUsage >= this.config.monthlyLimit) {
      return false
    }

    return true
  }

  updateStats(result: EmailResult): void {
    this.stats.sent++
    this.stats.dailyUsage++
    this.stats.monthlyUsage++
    this.stats.lastUsed = new Date()

    if (result.success) {
      this.stats.delivered++
      if (result.deliveryTime) {
        this.stats.averageDeliveryTime = 
          (this.stats.averageDeliveryTime + result.deliveryTime) / 2
      }
    } else {
      this.stats.failed++
      // Mark as unhealthy if failure rate is too high
      const failureRate = this.stats.failed / this.stats.sent
      if (failureRate > 0.1 && this.stats.sent > 10) {
        this.stats.isHealthy = false
      }
    }
  }

  resetDailyStats(): void {
    this.stats.dailyUsage = 0
  }

  resetMonthlyStats(): void {
    this.stats.monthlyUsage = 0
  }

  markHealthy(): void {
    this.stats.isHealthy = true
  }

  markUnhealthy(): void {
    this.stats.isHealthy = false
  }
}

export interface QueuedEmail {
  id: string
  email: EmailData
  priority: number
  attempts: number
  maxAttempts: number
  scheduledAt: Date
  createdAt: Date
  lastAttemptAt?: Date
  error?: string
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled'
}

export interface QueueStats {
  pending: number
  processing: number
  sent: number
  failed: number
  totalProcessed: number
  averageProcessingTime: number
  lastProcessedAt?: Date
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  html: string
  text?: string
  variables: string[]
  category: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface EmailCampaign {
  id: string
  name: string
  templateId: string
  recipients: string[]
  scheduledAt?: Date
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled'
  stats: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
    complained: number
  }
  createdAt: Date
  sentAt?: Date
}

export interface WebhookPayload {
  provider: string
  signature?: string
  timestamp?: number
  token?: string
  data: any
}
