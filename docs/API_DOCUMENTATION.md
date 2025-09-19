# API Documentation - SNPITC Email & Payment System

## Overview

This document provides comprehensive API documentation for the SNPITC Email and Payment Management System. The API follows RESTful principles and uses JSON for data exchange.

## Base URL

```
Production: https://your-domain.com/api
Staging: https://staging.your-domain.com/api
Development: http://localhost:3000/api
```

## Authentication

### Admin Authentication

All admin API endpoints require authentication using NextAuth.js session tokens.

```javascript
// Include session token in requests
fetch('/api/admin/email/accounts', {
  headers: {
    'Authorization': 'Bearer <session-token>',
    'Content-Type': 'application/json'
  }
})
```

### API Key Authentication (Optional)

For server-to-server communication:

```javascript
fetch('/api/admin/email/accounts', {
  headers: {
    'X-API-Key': '<your-api-key>',
    'Content-Type': 'application/json'
  }
})
```

## Email Account Management API

### List Email Accounts

```http
GET /api/admin/email/accounts
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| page | integer | Page number | 1 |
| limit | integer | Items per page | 20 |
| search | string | Search term | - |
| type | string | Account type (STUDENT, FACULTY, STAFF) | - |
| status | string | Account status (active, inactive) | - |

**Response:**

```json
{
  "accounts": [
    {
      "id": "account-id",
      "email": "student@institute.edu",
      "displayName": "John Doe",
      "type": "STUDENT",
      "isActive": true,
      "quota": 1073741824,
      "createdAt": "2024-01-01T00:00:00Z",
      "stats": {
        "emailsSent": 25,
        "emailsReceived": 48,
        "storageUsed": 52428800,
        "lastLogin": "2024-01-15T10:30:00Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### Create Email Account

```http
POST /api/admin/email/accounts
```

**Request Body:**

```json
{
  "email": "newstudent@institute.edu",
  "password": "securePassword123",
  "type": "STUDENT",
  "displayName": "Jane Smith",
  "isActive": true,
  "quota": 1073741824
}
```

**Response:**

```json
{
  "message": "Email account created successfully",
  "account": {
    "id": "new-account-id",
    "email": "newstudent@institute.edu",
    "displayName": "Jane Smith",
    "type": "STUDENT",
    "isActive": true,
    "quota": 1073741824,
    "createdAt": "2024-01-15T12:00:00Z"
  }
}
```

### Update Email Account

```http
PUT /api/admin/email/accounts/{id}
```

**Request Body:**

```json
{
  "displayName": "Jane Smith Updated",
  "isActive": false,
  "quota": 2147483648
}
```

### Bulk Operations

```http
PUT /api/admin/email/accounts
```

**Request Body:**

```json
{
  "action": "activate",
  "accountIds": ["account-1", "account-2", "account-3"]
}
```

**Available Actions:**
- `activate`: Activate accounts
- `deactivate`: Deactivate accounts
- `updateQuota`: Update storage quota
- `resetPassword`: Reset passwords
- `delete`: Delete accounts

## Email Monitoring API

### List Emails

```http
GET /api/admin/email/monitoring
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | integer | Page number |
| limit | integer | Items per page |
| from | string | Sender email |
| to | string | Recipient email |
| subject | string | Subject search |
| dateFrom | string | Start date (ISO 8601) |
| dateTo | string | End date (ISO 8601) |
| status | string | Email status |
| isSpam | boolean | Spam filter |

**Response:**

```json
{
  "emails": [
    {
      "id": "email-id",
      "messageId": "unique-message-id",
      "fromEmail": "sender@institute.edu",
      "subject": "Important Announcement",
      "status": "SENT",
      "sentAt": "2024-01-15T10:00:00Z",
      "isSpam": false,
      "spamScore": 0.1,
      "recipients": [
        {
          "email": "recipient@institute.edu",
          "type": "TO"
        }
      ],
      "attachments": [
        {
          "filename": "document.pdf",
          "size": 1048576,
          "virusScanResult": "CLEAN"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "pages": 25
  }
}
```

### Get Email Details

```http
GET /api/admin/email/monitoring/{id}
```

**Response:**

```json
{
  "id": "email-id",
  "messageId": "unique-message-id",
  "fromEmail": "sender@institute.edu",
  "subject": "Important Announcement",
  "body": "<html>Email content...</html>",
  "bodyText": "Email content in plain text",
  "headers": {
    "Date": "Mon, 15 Jan 2024 10:00:00 +0000",
    "From": "sender@institute.edu",
    "To": "recipient@institute.edu"
  },
  "status": "SENT",
  "sentAt": "2024-01-15T10:00:00Z",
  "deliveredAt": "2024-01-15T10:00:05Z",
  "isSpam": false,
  "spamScore": 0.1,
  "recipients": [...],
  "attachments": [...]
}
```

## Payment Catalog API

### List Payment Items

```http
GET /api/admin/payments/catalog
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | integer | Page number |
| limit | integer | Items per page |
| search | string | Search term |
| feeType | string | Fee type filter |
| category | string | Category filter |
| status | string | Active status |

**Response:**

```json
{
  "items": [
    {
      "id": "item-id",
      "name": "Semester Fee",
      "description": "Regular semester tuition fee",
      "feeType": "SEMESTER",
      "amount": 50000,
      "currency": "INR",
      "category": "Academic",
      "subcategory": "Tuition",
      "isActive": true,
      "isRecurring": true,
      "recurringInterval": "SEMESTER",
      "dueDate": "2024-07-31T23:59:59Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "stats": {
        "totalPayments": 150,
        "completedPayments": 145,
        "totalRevenue": 7250000
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "pages": 2
  }
}
```

### Create Payment Item

```http
POST /api/admin/payments/catalog
```

**Request Body:**

```json
{
  "name": "Library Fee",
  "description": "Annual library access fee",
  "feeType": "LIBRARY",
  "amount": 2000,
  "currency": "INR",
  "category": "Services",
  "subcategory": "Library",
  "isActive": true,
  "isRecurring": true,
  "recurringInterval": "YEARLY",
  "applicableFor": ["STUDENT", "FACULTY"],
  "dueDate": "2024-12-31T23:59:59Z",
  "lateFee": 100,
  "discountPercentage": 0
}
```

### Update Payment Item

```http
PUT /api/admin/payments/catalog/{id}
```

### Bulk Operations

```http
PUT /api/admin/payments/catalog
```

**Request Body:**

```json
{
  "action": "activate",
  "itemIds": ["item-1", "item-2"],
  "data": {
    "discountPercentage": 10
  }
}
```

## Payment Transactions API

### List Transactions

```http
GET /api/admin/payments/transactions
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | integer | Page number |
| limit | integer | Items per page |
| search | string | Search term |
| status | string | Transaction status |
| gateway | string | Payment gateway |
| dateFrom | string | Start date |
| dateTo | string | End date |
| minAmount | number | Minimum amount |
| maxAmount | number | Maximum amount |

**Response:**

```json
{
  "transactions": [
    {
      "id": "transaction-id",
      "transactionId": "TXN_20240115_001",
      "student": {
        "email": "student@institute.edu",
        "displayName": "John Doe",
        "type": "STUDENT"
      },
      "catalogItem": {
        "name": "Semester Fee",
        "category": "Academic"
      },
      "feeType": "SEMESTER",
      "totalAmount": 50000,
      "currency": "INR",
      "status": "COMPLETED",
      "gateway": "RAZORPAY",
      "paymentMethod": "card",
      "createdAt": "2024-01-15T10:00:00Z",
      "completedAt": "2024-01-15T10:00:30Z",
      "dueDate": "2024-07-31T23:59:59Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1000,
    "pages": 50
  }
}
```

### Get Transaction Details

```http
GET /api/admin/payments/transactions/{id}
```

### Transaction Analytics

```http
POST /api/admin/payments/transactions
```

**Request Body:**

```json
{
  "action": "analytics",
  "analytics": {
    "timeRange": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-31T23:59:59Z"
    },
    "metrics": ["revenue", "status", "gateways"]
  }
}
```

**Response:**

```json
{
  "revenue": {
    "_sum": { "totalAmount": 5000000 },
    "_count": 100,
    "_avg": { "totalAmount": 50000 }
  },
  "statusBreakdown": [
    {
      "status": "COMPLETED",
      "_count": 95,
      "_sum": { "totalAmount": 4750000 }
    },
    {
      "status": "FAILED",
      "_count": 5,
      "_sum": { "totalAmount": 250000 }
    }
  ],
  "gatewayPerformance": [
    {
      "gateway": "RAZORPAY",
      "_count": 60,
      "_sum": { "totalAmount": 3000000 },
      "_avg": { "totalAmount": 50000 }
    }
  ]
}
```

## System Health API

### Health Check

```http
GET /api/health
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "email": "healthy",
    "payments": "healthy"
  },
  "version": "1.0.0"
}
```

### Detailed Health Check

```http
GET /api/admin/health
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00Z",
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": 15,
      "connections": 5
    },
    "redis": {
      "status": "healthy",
      "responseTime": 2,
      "memory": "50MB"
    },
    "email": {
      "status": "healthy",
      "accounts": 150,
      "emailsToday": 500
    },
    "payments": {
      "status": "healthy",
      "transactionsToday": 25,
      "revenue": 125000
    }
  },
  "metrics": {
    "uptime": 86400,
    "memoryUsage": "512MB",
    "cpuUsage": "25%"
  }
}
```

## Error Handling

### Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Specific error details"
  },
  "timestamp": "2024-01-15T12:00:00Z"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid input data |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Admin API**: 50 requests per 15 minutes
- **Authentication**: 10 requests per 15 minutes

Rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

## Webhooks

### Payment Webhooks

Configure webhooks to receive payment notifications:

```http
POST /api/webhooks/payments
```

**Webhook Payload:**

```json
{
  "event": "payment.completed",
  "data": {
    "transactionId": "TXN_20240115_001",
    "amount": 50000,
    "currency": "INR",
    "status": "COMPLETED",
    "gateway": "RAZORPAY",
    "timestamp": "2024-01-15T10:00:30Z"
  }
}
```

### Email Webhooks

```http
POST /api/webhooks/email
```

**Webhook Payload:**

```json
{
  "event": "email.received",
  "data": {
    "messageId": "unique-message-id",
    "from": "sender@institute.edu",
    "to": "recipient@institute.edu",
    "subject": "Email Subject",
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

## SDK and Libraries

### JavaScript SDK

```javascript
import { SNPITCClient } from '@snpitc/api-client'

const client = new SNPITCClient({
  baseURL: 'https://your-domain.com/api',
  apiKey: 'your-api-key'
})

// List email accounts
const accounts = await client.email.accounts.list({
  page: 1,
  limit: 20
})

// Create payment item
const item = await client.payments.catalog.create({
  name: 'New Fee',
  amount: 1000,
  feeType: 'LIBRARY'
})
```

### Python SDK

```python
from snpitc_client import SNPITCClient

client = SNPITCClient(
    base_url='https://your-domain.com/api',
    api_key='your-api-key'
)

# List transactions
transactions = client.payments.transactions.list(
    page=1,
    limit=20,
    status='COMPLETED'
)

# Get email details
email = client.email.monitoring.get('email-id')
```

For more detailed examples and advanced usage, refer to the SDK documentation and example repositories.
