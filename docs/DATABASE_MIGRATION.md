# Database Migration Guide - Email & Payment Integration

## Overview

This guide covers the database migration process for integrating the SNPITC Email System with the admin panel, including new email and payment management capabilities.

## Migration Components

### 1. Schema Changes

#### New Models Added:
- **PaymentCatalogItem**: Manages payment items, fees, and pricing
- **AdminAuditLog**: Tracks all admin actions for compliance
- **SystemAlert**: System notifications and alerts

#### Enhanced Models:
- **User**: Added relations for payment items and audit logs
- **Payment**: Added catalog item relation
- **Email**: Enhanced with user relations

#### New Enums:
- **RecurringInterval**: MONTHLY, QUARTERLY, SEMESTER, YEARLY
- **AlertType**: INFO, WARNING, ERROR, CRITICAL
- **AlertSeverity**: LOW, MEDIUM, HIGH, CRITICAL

### 2. Database Relations

```mermaid
erDiagram
    User ||--o{ PaymentCatalogItem : creates
    User ||--o{ AdminAuditLog : performs
    User ||--o{ SystemAlert : acknowledges
    PaymentCatalogItem ||--o{ Payment : generates
    EmailAccount ||--o{ Payment : makes
    User ||--o{ Email : sends
    User ||--o{ Email : receives
```

## Migration Process

### Prerequisites

1. **Backup Database**: Always backup your database before migration
   ```bash
   pg_dump your_database > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Environment Setup**: Ensure all environment variables are configured
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/database"
   ```

3. **Dependencies**: Install required packages
   ```bash
   npm install
   ```

### Step-by-Step Migration

#### 1. Generate Prisma Client
```bash
npx prisma generate
```

#### 2. Run Database Migration
```bash
npm run migrate:email-payment
```

This script will:
- Generate updated Prisma client
- Create database migration
- Seed payment catalog
- Create admin user
- Setup performance indexes
- Validate schema

#### 3. Validate Migration
```bash
npm run migrate:validate
```

This will run comprehensive validation tests to ensure:
- All tables exist
- Relations work correctly
- Indexes are created
- Sample data is seeded
- API compatibility
- Security features

#### 4. Seed Database (Optional)
```bash
npx prisma db seed
```

### Manual Migration Steps

If you prefer manual migration:

#### 1. Create Migration
```bash
npx prisma migrate dev --name email-payment-integration
```

#### 2. Apply Migration
```bash
npx prisma migrate deploy
```

#### 3. Seed Data
```bash
npx prisma db seed
```

## Schema Details

### PaymentCatalogItem Model

```prisma
model PaymentCatalogItem {
  id                  String              @id @default(cuid())
  name                String
  description         String?
  feeType             FeeType
  amount              Float
  currency            String              @default("INR")
  category            String?
  subcategory         String?
  isActive            Boolean             @default(true)
  isRecurring         Boolean             @default(false)
  recurringInterval   RecurringInterval?
  lateFee             Float               @default(0)
  discountPercentage  Float               @default(0)
  dueDate             DateTime?
  applicableFor       AccountType[]       @default([STUDENT])
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt
  deletedAt           DateTime?
  createdById         String
  
  // Relations
  createdBy           User                @relation("CreatedPaymentItems", fields: [createdById], references: [id])
  payments            Payment[]

  @@map("payment_catalog_items")
}
```

### AdminAuditLog Model

```prisma
model AdminAuditLog {
  id          String    @id @default(cuid())
  userId      String
  userEmail   String
  action      String
  resource    String
  resourceId  String?
  details     Json?
  ipAddress   String?
  userAgent   String?
  success     Boolean   @default(true)
  errorMessage String?
  createdAt   DateTime  @default(now())

  // Relations
  user        User      @relation("AdminActions", fields: [userId], references: [id])

  @@map("admin_audit_logs")
}
```

### SystemAlert Model

```prisma
model SystemAlert {
  id              String      @id @default(cuid())
  title           String
  message         String
  type            AlertType   @default(INFO)
  category        String?
  severity        AlertSeverity @default(LOW)
  isAcknowledged  Boolean     @default(false)
  acknowledgedBy  String?
  acknowledgedAt  DateTime?
  createdAt       DateTime    @default(now())
  expiresAt       DateTime?

  // Relations
  acknowledgedByUser User?    @relation("AcknowledgedAlerts", fields: [acknowledgedBy], references: [id])

  @@map("system_alerts")
}
```

## Performance Optimizations

### Indexes Created

The migration creates the following indexes for optimal performance:

```sql
-- Email performance indexes
CREATE INDEX idx_emails_created_at ON emails(created_at DESC);
CREATE INDEX idx_emails_from_email ON emails(from_email);
CREATE INDEX idx_emails_status ON emails(status);
CREATE INDEX idx_emails_spam ON emails(is_spam);

-- Payment performance indexes
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_gateway ON payments(gateway);

-- Audit log indexes
CREATE INDEX idx_audit_logs_created_at ON admin_audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user_id ON admin_audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON admin_audit_logs(action);

-- Alert indexes
CREATE INDEX idx_alerts_created_at ON system_alerts(created_at DESC);
CREATE INDEX idx_alerts_acknowledged ON system_alerts(is_acknowledged);
```

## Sample Data

The migration seeds the following sample data:

### Payment Catalog Items
- **Semester Fee**: ₹50,000 (Recurring: Semester)
- **Library Fee**: ₹2,000 (Recurring: Yearly)
- **Exam Fee**: ₹1,500 (Recurring: Semester)
- **Hostel Fee**: ₹8,000 (Recurring: Monthly)
- **Transport Fee**: ₹1,200 (Recurring: Monthly)

### Email Accounts
- **student1@institute.edu**: Student account (1GB quota)
- **student2@institute.edu**: Student account (1GB quota)
- **faculty1@institute.edu**: Faculty account (5GB quota)

### Admin User
- **admin@institute.edu**: System administrator

## Rollback Procedure

If you need to rollback the migration:

### 1. Automated Rollback
```bash
npm run migrate:rollback
```

### 2. Manual Rollback
```bash
npx prisma migrate reset
```

**⚠️ Warning**: This will delete all data. Restore from backup if needed.

### 3. Restore from Backup
```bash
psql your_database < backup_file.sql
```

## Troubleshooting

### Common Issues

#### 1. Migration Fails
- **Check database connection**: Ensure DATABASE_URL is correct
- **Check permissions**: Ensure database user has CREATE privileges
- **Check disk space**: Ensure sufficient disk space for migration

#### 2. Validation Fails
- **Check relations**: Ensure foreign key constraints are satisfied
- **Check data types**: Ensure enum values are valid
- **Check indexes**: Ensure index creation succeeded

#### 3. Seeding Fails
- **Check admin user**: Ensure admin user exists before seeding
- **Check unique constraints**: Ensure no duplicate data
- **Check required fields**: Ensure all required fields are provided

### Error Resolution

#### Foreign Key Constraint Errors
```sql
-- Check constraint violations
SELECT * FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY';
```

#### Enum Value Errors
```sql
-- Check enum values
SELECT unnest(enum_range(NULL::RecurringInterval));
```

#### Index Creation Errors
```sql
-- Check existing indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'your_table';
```

## Post-Migration Checklist

- [ ] All tables created successfully
- [ ] All relations working correctly
- [ ] All indexes created
- [ ] Sample data seeded
- [ ] Validation tests pass
- [ ] API endpoints functional
- [ ] Admin panel accessible
- [ ] Email management working
- [ ] Payment management working
- [ ] Audit logging active
- [ ] System alerts functional

## Security Considerations

### Data Protection
- All passwords are hashed using bcrypt
- Sensitive data is encrypted at rest
- Audit logs track all admin actions
- Role-based access control enforced

### Compliance
- GDPR compliance features enabled
- FERPA compliance features enabled
- Audit trails for all data access
- Data export capabilities

## Monitoring

After migration, monitor:
- Database performance
- Query execution times
- Index usage
- Storage growth
- Error rates

Use the built-in monitoring dashboard at `/admin/monitoring` for real-time metrics.

## Support

For migration issues:
1. Check the troubleshooting section above
2. Review migration logs
3. Run validation script
4. Check database logs
5. Contact system administrator

## Next Steps

After successful migration:
1. Run comprehensive tests
2. Update documentation
3. Train administrators
4. Configure monitoring
5. Set up backup schedules
