# SMTP Email Infrastructure Implementation Plan

## Overview

This document outlines the comprehensive SMTP email infrastructure implementation for the SNPITC Email & Payment Management System, designed for Vercel free tier deployment with no external paid services.

## 1. Infrastructure Analysis

### 1.1 Vercel Limitations Assessment

**Serverless Function Constraints:**
- **Timeout Limits**: 10 seconds for Hobby plan, 60 seconds for Pro
- **Memory Limits**: 1024MB maximum
- **Cold Start Delays**: 1-3 seconds for function initialization
- **No Persistent Connections**: Functions are stateless
- **No Background Jobs**: No native cron or queue system

**Implications for SMTP:**
- ❌ **Direct SMTP not viable**: Persistent connections required
- ✅ **API-based email services**: RESTful APIs work well
- ✅ **Webhook handling**: Suitable for delivery callbacks
- ⚠️ **Queue processing**: Requires external service or polling

### 1.2 Free SMTP/Email Service Options

#### **Option 1: Mailgun (Recommended Primary)**
- **Free Tier**: 1,000 emails/month for 3 months, then paid
- **API Integration**: Excellent RESTful API
- **Deliverability**: High reputation, good inbox placement
- **Features**: Templates, tracking, webhooks, analytics
- **Vercel Compatibility**: ✅ Perfect fit

#### **Option 2: SendGrid (Recommended Secondary)**
- **Free Tier**: 100 emails/day (3,000/month)
- **API Integration**: Robust API with good documentation
- **Deliverability**: Enterprise-grade delivery
- **Features**: Templates, analytics, webhooks
- **Vercel Compatibility**: ✅ Excellent

#### **Option 3: Amazon SES (Budget Option)**
- **Free Tier**: 62,000 emails/month (if sending from EC2)
- **Cost**: $0.10 per 1,000 emails after free tier
- **API Integration**: AWS SDK integration
- **Deliverability**: Good, requires domain verification
- **Vercel Compatibility**: ✅ Good with AWS SDK

#### **Option 4: Resend (Developer-Friendly)**
- **Free Tier**: 3,000 emails/month
- **API Integration**: Modern, developer-focused API
- **Deliverability**: Good and improving
- **Features**: React email templates, webhooks
- **Vercel Compatibility**: ✅ Excellent

### 1.3 Development/Testing Options

#### **Mailtrap (Recommended for Development)**
- **Free Tier**: 500 emails/month in sandbox
- **Purpose**: Email testing without actual delivery
- **Features**: Email inspection, spam analysis
- **Integration**: SMTP and API options

#### **Ethereal Email (Alternative)**
- **Free**: Unlimited fake emails
- **Purpose**: Development and testing only
- **Features**: Web interface for viewing emails
- **Integration**: Standard SMTP

## 2. Recommended Architecture

### 2.1 Multi-Provider Strategy

```typescript
// Email service hierarchy
Primary: Mailgun API (1,000 emails/month)
Secondary: SendGrid API (100 emails/day)
Fallback: Amazon SES (pay-per-use)
Development: Mailtrap (testing)
```

### 2.2 Email Queue System

**Option A: Database-Based Queue (Recommended)**
```sql
-- Email queue table
CREATE TABLE email_queue (
  id TEXT PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  priority INTEGER DEFAULT 5,
  max_attempts INTEGER DEFAULT 3,
  attempts INTEGER DEFAULT 0,
  status TEXT DEFAULT 'PENDING',
  scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP,
  error_message TEXT,
  provider TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Option B: External Queue Service**
- Upstash Redis (free tier: 10,000 commands/day)
- Railway Redis (free tier with limitations)

### 2.3 Processing Strategy

**Immediate Processing (Real-time)**
- User registration emails
- Password reset emails
- Payment confirmations
- Critical notifications

**Batch Processing (Scheduled)**
- Newsletter emails
- Bulk notifications
- Fee reminders
- System reports

## 3. Implementation Plan

### 3.1 Phase 1: Core Email Service (Week 1)

#### Email Service Provider Setup
```typescript
// lib/email-providers/mailgun.ts
export class MailgunProvider implements EmailProvider {
  async sendEmail(email: EmailData): Promise<EmailResult>
  async getDeliveryStatus(messageId: string): Promise<DeliveryStatus>
  async handleWebhook(payload: any): Promise<void>
}

// lib/email-providers/sendgrid.ts
export class SendGridProvider implements EmailProvider {
  async sendEmail(email: EmailData): Promise<EmailResult>
  async getDeliveryStatus(messageId: string): Promise<DeliveryStatus>
  async handleWebhook(payload: any): Promise<void>
}
```

#### Email Service Manager
```typescript
// lib/email-service-manager.ts
export class EmailServiceManager {
  private providers: EmailProvider[]
  
  async sendEmail(email: EmailData): Promise<EmailResult> {
    // Try providers in order until success
    for (const provider of this.providers) {
      try {
        return await provider.sendEmail(email)
      } catch (error) {
        // Log error and try next provider
      }
    }
    throw new Error('All email providers failed')
  }
}
```

### 3.2 Phase 2: Queue System (Week 2)

#### Database Queue Implementation
```typescript
// lib/email-queue.ts
export class EmailQueue {
  async enqueue(email: EmailData, priority = 5): Promise<string>
  async dequeue(limit = 10): Promise<QueuedEmail[]>
  async markSent(id: string, result: EmailResult): Promise<void>
  async markFailed(id: string, error: string): Promise<void>
  async retry(id: string): Promise<void>
}
```

#### Queue Processor
```typescript
// lib/email-processor.ts
export class EmailProcessor {
  async processQueue(): Promise<void> {
    const emails = await this.queue.dequeue(10)
    
    for (const email of emails) {
      try {
        const result = await this.emailService.sendEmail(email)
        await this.queue.markSent(email.id, result)
      } catch (error) {
        await this.queue.markFailed(email.id, error.message)
      }
    }
  }
}
```

### 3.3 Phase 3: Templates & Tracking (Week 3)

#### Email Templates
```typescript
// lib/email-templates/
├── welcome.tsx              // User registration
├── password-reset.tsx       // Password reset
├── payment-confirmation.tsx // Payment success
├── fee-reminder.tsx         // Payment due
├── receipt.tsx              // Payment receipt
└── system-notification.tsx  // System alerts
```

#### Delivery Tracking
```typescript
// lib/email-tracking.ts
export class EmailTracker {
  async trackDelivery(messageId: string): Promise<DeliveryStatus>
  async trackOpens(messageId: string): Promise<OpenEvent[]>
  async trackClicks(messageId: string): Promise<ClickEvent[]>
  async handleWebhook(provider: string, payload: any): Promise<void>
}
```

## 4. API Endpoints

### 4.1 Email Sending API
```typescript
// /api/email/send
POST /api/email/send
{
  "to": "student@institute.edu",
  "subject": "Welcome to SNPITC",
  "template": "welcome",
  "data": { "name": "John Doe" },
  "priority": 1
}
```

### 4.2 Queue Management API
```typescript
// /api/email/queue
GET /api/email/queue/status
POST /api/email/queue/process
GET /api/email/queue/stats
```

### 4.3 Webhook Handlers
```typescript
// /api/webhooks/mailgun
// /api/webhooks/sendgrid
// /api/webhooks/ses
```

## 5. Configuration Management

### 5.1 Environment Variables
```bash
# Primary Provider (Mailgun)
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_domain.com
MAILGUN_WEBHOOK_SECRET=your_webhook_secret

# Secondary Provider (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_WEBHOOK_SECRET=your_webhook_secret

# Fallback Provider (Amazon SES)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# Development
MAILTRAP_USERNAME=your_mailtrap_username
MAILTRAP_PASSWORD=your_mailtrap_password

# Email Configuration
EMAIL_FROM_ADDRESS=noreply@institute.edu
EMAIL_FROM_NAME=SNPITC System
EMAIL_REPLY_TO=support@institute.edu
```

### 5.2 Provider Configuration
```typescript
// lib/email-config.ts
export const emailConfig = {
  providers: [
    {
      name: 'mailgun',
      enabled: process.env.NODE_ENV === 'production',
      priority: 1,
      dailyLimit: 1000,
      monthlyLimit: 1000
    },
    {
      name: 'sendgrid',
      enabled: true,
      priority: 2,
      dailyLimit: 100,
      monthlyLimit: 3000
    }
  ],
  queue: {
    batchSize: 10,
    retryAttempts: 3,
    retryDelay: 300000 // 5 minutes
  }
}
```

## 6. Monitoring & Analytics

### 6.1 Email Metrics
- Delivery rates by provider
- Open rates by email type
- Click-through rates
- Bounce rates
- Spam complaints

### 6.2 System Health
- Queue size and processing time
- Provider availability
- Error rates by provider
- Daily/monthly usage tracking

## 7. Security Considerations

### 7.1 API Key Management
- Store in environment variables
- Rotate keys regularly
- Use different keys for different environments

### 7.2 Webhook Security
- Verify webhook signatures
- Use HTTPS endpoints only
- Implement rate limiting

### 7.3 Email Content Security
- Sanitize HTML content
- Validate email addresses
- Implement SPF, DKIM, DMARC

## 8. Cost Optimization

### 8.1 Free Tier Management
- Monitor usage across providers
- Implement automatic failover
- Queue non-critical emails for off-peak processing

### 8.2 Efficiency Measures
- Batch similar emails
- Use templates to reduce payload size
- Implement email deduplication
- Cache provider responses

## 9. Testing Strategy

### 9.1 Unit Tests
- Provider implementations
- Queue operations
- Template rendering
- Webhook handling

### 9.2 Integration Tests
- End-to-end email delivery
- Provider failover scenarios
- Queue processing under load
- Webhook payload validation

### 9.3 Load Testing
- Queue performance with high volume
- Provider rate limiting behavior
- Concurrent processing capabilities

## 10. Deployment Checklist

### 10.1 Pre-deployment
- [ ] Configure all email providers
- [ ] Set up domain authentication (SPF, DKIM)
- [ ] Test webhook endpoints
- [ ] Verify template rendering
- [ ] Configure monitoring

### 10.2 Post-deployment
- [ ] Monitor delivery rates
- [ ] Check webhook processing
- [ ] Verify queue processing
- [ ] Test failover scenarios
- [ ] Monitor error rates

This infrastructure plan provides a robust, scalable, and cost-effective email system suitable for the SNPITC platform while maintaining compatibility with Vercel's serverless architecture.
