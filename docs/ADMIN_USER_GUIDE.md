# Admin User Guide - SNPITC Email & Payment Management System

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Email Account Management](#email-account-management)
4. [Email Monitoring](#email-monitoring)
5. [Payment Catalog Management](#payment-catalog-management)
6. [Payment Transaction Monitoring](#payment-transaction-monitoring)
7. [System Administration](#system-administration)
8. [Troubleshooting](#troubleshooting)

## Getting Started

### Accessing the Admin Panel

1. **Login URL**: Navigate to `https://your-domain.com/admin`
2. **Credentials**: Use your administrator credentials
3. **Two-Factor Authentication**: If enabled, enter your 2FA code

### First-Time Setup

After logging in for the first time:

1. **Review System Status**: Check the dashboard for any alerts
2. **Verify Email Configuration**: Ensure SMTP settings are correct
3. **Test Payment Gateways**: Verify all payment gateways are configured
4. **Set Up Monitoring**: Configure alerts and notifications

## Dashboard Overview

The admin dashboard provides a comprehensive overview of the system:

### Key Metrics Cards

- **Total Users**: Number of registered users
- **Active Email Accounts**: Currently active email accounts
- **Total Revenue**: Cumulative payment revenue
- **System Health**: Overall system status

### Quick Actions

- **Create Email Account**: Add new student/staff email accounts
- **Add Payment Item**: Create new fees or payment items
- **View Recent Activity**: Monitor recent system activities
- **System Alerts**: View and manage system notifications

### Navigation Menu

- **Dashboard**: System overview and metrics
- **Email Management**: Email accounts and monitoring
- **Payment Management**: Catalog and transactions
- **System Settings**: Configuration and maintenance
- **Reports**: Analytics and reporting

## Email Account Management

### Creating Email Accounts

1. **Navigate**: Go to `Email Management > Account Management`
2. **Click**: "Create Account" button
3. **Fill Form**:
   - **Email Address**: Enter the desired email (e.g., student123@institute.edu)
   - **Password**: Set a secure password or auto-generate
   - **Account Type**: Select STUDENT, FACULTY, or STAFF
   - **Display Name**: Full name of the user
   - **Quota**: Set storage limit (default: 1GB for students, 5GB for faculty)
4. **Submit**: Click "Create Account"

### Managing Existing Accounts

#### Viewing Account Details

1. **Search**: Use the search bar to find specific accounts
2. **Filter**: Apply filters by type, status, or creation date
3. **Click**: On any account row to view details

#### Account Actions

- **Edit Account**: Modify account details, quota, or status
- **Reset Password**: Generate new password for the account
- **Suspend Account**: Temporarily disable the account
- **Delete Account**: Permanently remove the account (with confirmation)

#### Bulk Operations

1. **Select**: Check multiple accounts using checkboxes
2. **Choose Action**: Select from bulk actions dropdown
   - Activate/Deactivate accounts
   - Update quotas
   - Send notifications
   - Export account list

### Account Statistics

Each account displays:

- **Storage Usage**: Current storage consumption
- **Email Activity**: Sent/received email counts
- **Last Login**: Most recent access time
- **Payment History**: Associated payment records

## Email Monitoring

### Real-Time Monitoring

Access email monitoring at `Email Management > Monitoring`:

#### Email Traffic Overview

- **Total Emails**: Daily/weekly/monthly email counts
- **Spam Detection**: Blocked spam emails
- **Delivery Status**: Success/failure rates
- **Top Senders/Recipients**: Most active users

#### Content Monitoring

1. **Search Emails**: Use advanced search filters
   - **Date Range**: Specify time period
   - **Sender/Recipient**: Filter by email addresses
   - **Subject Keywords**: Search email subjects
   - **Content**: Search email body (if enabled)
   - **Attachments**: Filter emails with attachments

2. **Security Monitoring**:
   - **Spam Score**: View spam detection scores
   - **Virus Scans**: Check attachment scan results
   - **Suspicious Activity**: Monitor unusual patterns

#### Email Details

Click on any email to view:

- **Full Headers**: Complete email metadata
- **Content**: Email body (text and HTML)
- **Attachments**: List of attached files with scan results
- **Delivery Path**: Routing and delivery information
- **Security Analysis**: Spam and virus scan results

### Compliance Features

- **Data Retention**: Automatic email archiving per policy
- **Audit Logs**: Complete access and modification logs
- **Export Options**: Export emails for legal/compliance purposes
- **Privacy Controls**: Manage data access permissions

## Payment Catalog Management

### Creating Payment Items

1. **Navigate**: Go to `Payment Management > Catalog`
2. **Click**: "Add Item" button
3. **Fill Form**:
   - **Name**: Descriptive name (e.g., "Semester Fee")
   - **Description**: Detailed description
   - **Fee Type**: Select category (SEMESTER, EXAM, LIBRARY, etc.)
   - **Amount**: Set price in INR
   - **Category**: Organize by category (Academic, Services, etc.)
   - **Recurring**: Enable if payment repeats
   - **Due Date**: Set payment deadline (optional)
   - **Applicable For**: Choose user types (STUDENT, FACULTY, STAFF)

### Managing Payment Items

#### Item Actions

- **Edit Item**: Modify details, pricing, or settings
- **Activate/Deactivate**: Enable or disable payment items
- **View Statistics**: See payment performance metrics
- **Duplicate Item**: Create similar items quickly

#### Bulk Operations

1. **Select Items**: Use checkboxes to select multiple items
2. **Choose Action**:
   - **Update Pricing**: Bulk price changes
   - **Change Status**: Activate/deactivate multiple items
   - **Update Categories**: Reorganize items
   - **Export Data**: Download item information

### Pricing Management

#### Setting Prices

- **Base Amount**: Standard price for the item
- **Discounts**: Percentage-based discounts
- **Late Fees**: Additional charges for overdue payments
- **Currency**: Support for multiple currencies

#### Recurring Payments

Configure automatic recurring payments:

- **Interval**: Monthly, Quarterly, Semester, Yearly
- **Start Date**: When recurring payments begin
- **End Date**: When recurring payments stop
- **Notifications**: Automatic payment reminders

### Performance Analytics

View detailed statistics for each payment item:

- **Total Payments**: Number of completed transactions
- **Revenue Generated**: Total amount collected
- **Success Rate**: Payment completion percentage
- **Popular Items**: Most frequently paid items
- **Seasonal Trends**: Payment patterns over time

## Payment Transaction Monitoring

### Transaction Overview

Access at `Payment Management > Transactions`:

#### Key Metrics

- **Total Revenue**: Cumulative earnings
- **Transaction Count**: Number of payments processed
- **Success Rate**: Percentage of successful payments
- **Average Amount**: Mean transaction value

#### Transaction List

View all transactions with details:

- **Transaction ID**: Unique payment identifier
- **Student Information**: Payer details
- **Amount**: Payment amount and currency
- **Status**: PENDING, COMPLETED, FAILED, REFUNDED
- **Gateway**: Payment processor used
- **Date/Time**: Transaction timestamp

### Advanced Filtering

Filter transactions by:

- **Date Range**: Specific time periods
- **Amount Range**: Minimum and maximum amounts
- **Payment Status**: Success, failure, pending
- **Gateway**: Specific payment processors
- **Student Type**: Filter by user category
- **Fee Type**: Filter by payment category

### Transaction Details

Click on any transaction to view:

- **Complete Information**: All transaction metadata
- **Payment Timeline**: Step-by-step payment process
- **Gateway Response**: Detailed gateway information
- **Student Profile**: Associated user information
- **Related Payments**: Other payments by same user

### Refund Management

Process refunds when necessary:

1. **Select Transaction**: Find the payment to refund
2. **Click Refund**: Choose refund option
3. **Enter Details**: Specify refund amount and reason
4. **Process**: Submit refund request to gateway
5. **Track Status**: Monitor refund processing

### Analytics and Reporting

#### Revenue Analytics

- **Daily/Weekly/Monthly Revenue**: Trend analysis
- **Payment Method Distribution**: Preferred payment types
- **Gateway Performance**: Success rates by processor
- **Geographic Analysis**: Payments by location

#### Export Options

- **CSV Export**: Download transaction data
- **PDF Reports**: Generate formatted reports
- **Custom Reports**: Create specific analytics
- **Scheduled Reports**: Automatic report generation

## System Administration

### User Management

#### Admin Users

Manage administrator accounts:

- **Create Admins**: Add new administrator users
- **Permissions**: Set role-based access controls
- **Activity Logs**: Monitor admin actions
- **Session Management**: Control active sessions

#### Audit Logging

All admin actions are logged:

- **Action Type**: What was performed
- **User**: Who performed the action
- **Timestamp**: When it occurred
- **Details**: Specific information about the action
- **IP Address**: Source of the action

### System Configuration

#### Email Settings

Configure email system parameters:

- **SMTP Configuration**: Outgoing email settings
- **Domain Settings**: Email domain configuration
- **Security Policies**: Spam and virus protection
- **Retention Policies**: Email archiving rules

#### Payment Settings

Configure payment processing:

- **Gateway Configuration**: Payment processor settings
- **Currency Settings**: Supported currencies
- **Fee Structures**: Default fee configurations
- **Notification Settings**: Payment alerts and reminders

### Monitoring and Alerts

#### System Health

Monitor system components:

- **Application Status**: Service availability
- **Database Performance**: Query performance and connections
- **Storage Usage**: Disk space and file storage
- **Network Connectivity**: External service connections

#### Alert Configuration

Set up automated alerts:

- **Performance Alerts**: System performance thresholds
- **Security Alerts**: Suspicious activity detection
- **Business Alerts**: Payment failures, high volumes
- **Maintenance Alerts**: System maintenance notifications

### Backup and Recovery

#### Automated Backups

- **Database Backups**: Daily automated database backups
- **File Backups**: Application data and uploads
- **Configuration Backups**: System settings and configurations
- **Retention Policy**: Backup retention schedules

#### Manual Backup

Create on-demand backups:

1. **Navigate**: Go to System Settings > Backup
2. **Select Type**: Choose backup scope
3. **Create Backup**: Initiate backup process
4. **Download**: Save backup files locally

#### Recovery Procedures

In case of data loss:

1. **Assess Damage**: Determine scope of data loss
2. **Select Backup**: Choose appropriate backup point
3. **Restore Data**: Follow recovery procedures
4. **Verify Integrity**: Confirm data restoration
5. **Resume Operations**: Return system to normal operation

## Troubleshooting

### Common Issues

#### Email Account Issues

**Problem**: Cannot create email account
- **Check**: Email domain configuration
- **Verify**: SMTP server connectivity
- **Solution**: Review email server settings

**Problem**: Email delivery failures
- **Check**: Spam filters and blacklists
- **Verify**: DNS configuration
- **Solution**: Contact email service provider

#### Payment Issues

**Problem**: Payment gateway errors
- **Check**: Gateway API credentials
- **Verify**: Network connectivity
- **Solution**: Review gateway configuration

**Problem**: Transaction failures
- **Check**: Gateway service status
- **Verify**: Payment details accuracy
- **Solution**: Retry transaction or contact gateway support

### System Performance

#### Slow Response Times

1. **Check System Resources**: CPU, memory, disk usage
2. **Review Database Performance**: Query optimization
3. **Monitor Network**: Bandwidth and latency
4. **Scale Resources**: Increase server capacity if needed

#### High Error Rates

1. **Review Error Logs**: Identify error patterns
2. **Check Dependencies**: External service status
3. **Verify Configuration**: System settings accuracy
4. **Contact Support**: If issues persist

### Getting Help

#### Documentation

- **User Guides**: Comprehensive usage instructions
- **API Documentation**: Technical integration guides
- **FAQ**: Frequently asked questions
- **Video Tutorials**: Step-by-step demonstrations

#### Support Channels

- **Help Desk**: Submit support tickets
- **Email Support**: Direct email assistance
- **Phone Support**: Emergency contact number
- **Community Forum**: User community discussions

#### Emergency Procedures

For critical issues:

1. **Immediate Response**: Contact emergency support
2. **Document Issue**: Record error details and steps
3. **Implement Workaround**: Temporary solutions if available
4. **Follow Up**: Track resolution progress

## Best Practices

### Security Best Practices

1. **Regular Password Updates**: Change admin passwords regularly
2. **Two-Factor Authentication**: Enable 2FA for all admin accounts
3. **Access Control**: Use principle of least privilege
4. **Regular Audits**: Review access logs and user activities
5. **Secure Communications**: Use HTTPS for all admin activities

### Performance Optimization

1. **Regular Maintenance**: Perform routine system maintenance
2. **Monitor Resources**: Keep track of system resource usage
3. **Database Optimization**: Regular database maintenance and optimization
4. **Cache Management**: Monitor and clear caches when necessary
5. **Update Management**: Keep system and dependencies updated

### Data Management

1. **Regular Backups**: Ensure automated backups are working
2. **Data Retention**: Follow institutional data retention policies
3. **Privacy Compliance**: Ensure GDPR/FERPA compliance
4. **Data Quality**: Regular data validation and cleanup
5. **Archive Management**: Proper archiving of old data

Remember to regularly review system logs, monitor performance metrics, and stay updated with system announcements for optimal administration of the SNPITC Email & Payment Management System.
