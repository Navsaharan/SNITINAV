# Production Deployment Guide - SNPITC Email & Payment System

## Overview

This guide covers the complete production deployment process for the SNPITC Email and Payment Integration system, including infrastructure setup, security configuration, monitoring, and maintenance procedures.

## Prerequisites

### System Requirements

**Minimum Hardware Requirements:**
- CPU: 4 cores (8 recommended)
- RAM: 8GB (16GB recommended)
- Storage: 100GB SSD (500GB recommended)
- Network: 1Gbps connection

**Software Requirements:**
- Ubuntu 20.04 LTS or CentOS 8+
- Docker 20.10+
- Docker Compose 2.0+
- Git 2.30+
- Node.js 18+ (for build process)

### Domain and SSL

1. **Domain Setup**:
   - Primary domain: `your-domain.com`
   - Admin subdomain: `admin.your-domain.com` (optional)
   - Email domain: `institute.edu`

2. **SSL Certificate**:
   - Obtain SSL certificates from Let's Encrypt or commercial CA
   - Place certificates in `nginx/ssl/` directory

### External Services

1. **Database**: PostgreSQL 15+ (managed service recommended)
2. **Redis**: Redis 7+ for caching and sessions
3. **Email**: SMTP service for outgoing emails
4. **Payment Gateways**: Razorpay, Stripe, PayU, Cashfree accounts
5. **Monitoring**: Optional external monitoring services

## Pre-Deployment Setup

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create deployment user
sudo useradd -m -s /bin/bash snpitc
sudo usermod -aG docker snpitc
sudo mkdir -p /home/snpitc/.ssh
```

### 2. Repository Setup

```bash
# Clone repository
cd /home/snpitc
git clone https://github.com/your-org/snpitc-remake.git
cd snpitc-remake

# Set up environment
cp .env.production.example .env.production
# Edit .env.production with your actual values
```

### 3. SSL Certificate Setup

```bash
# Using Let's Encrypt (recommended)
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Copy certificates
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem
sudo chown -R snpitc:snpitc nginx/ssl
```

### 4. Database Setup

```bash
# If using external PostgreSQL, create database
createdb snpitc_production

# If using Docker PostgreSQL, it will be created automatically
```

## Deployment Process

### 1. Automated Deployment

```bash
# Make deployment script executable
chmod +x scripts/deploy-production.sh

# Run deployment
./scripts/deploy-production.sh
```

### 2. Manual Deployment Steps

If you prefer manual deployment:

```bash
# 1. Validate environment
source .env.production
echo "Deploying to: $NEXTAUTH_URL"

# 2. Build images
docker-compose -f docker-compose.production.yml build

# 3. Run database migrations
npx prisma migrate deploy
npx prisma db seed

# 4. Start services
docker-compose -f docker-compose.production.yml up -d

# 5. Verify deployment
curl -f http://localhost:3000/api/health
```

## Configuration Details

### Environment Variables

Critical environment variables that must be configured:

```bash
# Application
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secret-key
ENCRYPTION_KEY=your-encryption-key

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Payment Gateways
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx
STRIPE_SECRET_KEY=sk_live_xxx

# Email
SMTP_HOST=smtp.your-domain.com
SMTP_USER=noreply@your-domain.com
SMTP_PASSWORD=xxx
```

### Docker Compose Services

The production deployment includes:

1. **app**: Main Next.js application
2. **postgres**: PostgreSQL database
3. **redis**: Redis cache and sessions
4. **nginx**: Reverse proxy and load balancer
5. **prometheus**: Metrics collection
6. **grafana**: Monitoring dashboards
7. **loki**: Log aggregation
8. **promtail**: Log collection
9. **backup**: Automated backup service

### Nginx Configuration

Key features of the Nginx setup:

- SSL/TLS termination
- HTTP to HTTPS redirect
- Rate limiting
- Security headers
- Static file caching
- Health check endpoints

## Security Configuration

### 1. Firewall Setup

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. SSL/TLS Configuration

- TLS 1.2 and 1.3 only
- Strong cipher suites
- HSTS headers
- Certificate auto-renewal

### 3. Application Security

- Rate limiting on API endpoints
- CORS configuration
- Security headers
- Input validation
- SQL injection protection
- XSS protection

### 4. Database Security

- Encrypted connections
- Strong passwords
- Limited user privileges
- Regular security updates

## Monitoring and Logging

### 1. Prometheus Metrics

Available at `http://localhost:9090`:

- Application performance metrics
- Database connection metrics
- Email system metrics
- Payment processing metrics
- System resource metrics

### 2. Grafana Dashboards

Available at `http://localhost:3001`:

- System overview dashboard
- Email system dashboard
- Payment system dashboard
- Security monitoring dashboard

### 3. Log Aggregation

Logs are collected from:

- Application logs (JSON format)
- Nginx access and error logs
- System logs
- Database logs

### 4. Alerting

Configure alerts for:

- High error rates
- Database connection issues
- Payment gateway failures
- Security incidents
- Resource exhaustion

## Backup and Recovery

### 1. Automated Backups

The backup service automatically:

- Creates daily database backups
- Backs up application data
- Uploads to S3 (if configured)
- Retains backups for 30 days

### 2. Manual Backup

```bash
# Database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Application data backup
tar -czf app_data_$(date +%Y%m%d).tar.gz uploads/

# Configuration backup
tar -czf config_$(date +%Y%m%d).tar.gz .env.production nginx/ monitoring/
```

### 3. Recovery Procedures

```bash
# Database recovery
psql $DATABASE_URL < backup_20240101.sql

# Application data recovery
tar -xzf app_data_20240101.tar.gz

# Restart services
docker-compose -f docker-compose.production.yml restart
```

## Maintenance Procedures

### 1. Regular Updates

```bash
# Update application
git pull origin main
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d

# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d
```

### 2. SSL Certificate Renewal

```bash
# Renew Let's Encrypt certificates
sudo certbot renew --dry-run
sudo certbot renew

# Update Nginx certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem
docker-compose -f docker-compose.production.yml restart nginx
```

### 3. Database Maintenance

```bash
# Connect to database
docker-compose -f docker-compose.production.yml exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB

# Run maintenance queries
VACUUM ANALYZE;
REINDEX DATABASE snpitc_production;

# Check database size
SELECT pg_size_pretty(pg_database_size('snpitc_production'));
```

### 4. Log Rotation

```bash
# Configure logrotate
sudo tee /etc/logrotate.d/snpitc << EOF
/var/log/snpitc/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 snpitc snpitc
    postrotate
        docker-compose -f /home/snpitc/snpitc-remake/docker-compose.production.yml restart app
    endscript
}
EOF
```

## Troubleshooting

### Common Issues

1. **Application won't start**:
   - Check environment variables
   - Verify database connectivity
   - Check Docker logs: `docker-compose logs app`

2. **Database connection errors**:
   - Verify DATABASE_URL
   - Check PostgreSQL service status
   - Ensure database exists and user has permissions

3. **SSL certificate issues**:
   - Verify certificate files exist
   - Check certificate expiration
   - Ensure proper file permissions

4. **Payment gateway errors**:
   - Verify API keys and secrets
   - Check gateway service status
   - Review webhook configurations

### Log Analysis

```bash
# View application logs
docker-compose -f docker-compose.production.yml logs -f app

# View Nginx logs
docker-compose -f docker-compose.production.yml logs -f nginx

# View database logs
docker-compose -f docker-compose.production.yml logs -f postgres

# Search for errors
docker-compose -f docker-compose.production.yml logs app | grep ERROR
```

### Performance Monitoring

```bash
# Check resource usage
docker stats

# Monitor database performance
docker-compose -f docker-compose.production.yml exec postgres pg_stat_activity

# Check disk usage
df -h
du -sh /var/lib/docker/
```

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**: Add multiple app instances behind load balancer
2. **Database**: Use read replicas for read-heavy workloads
3. **Redis**: Use Redis Cluster for high availability
4. **File Storage**: Use object storage (S3) for uploads

### Vertical Scaling

1. **Increase server resources**: CPU, RAM, storage
2. **Optimize database**: Tune PostgreSQL configuration
3. **Optimize application**: Enable caching, optimize queries

## Security Checklist

- [ ] SSL certificates installed and configured
- [ ] Firewall configured and enabled
- [ ] Strong passwords for all services
- [ ] Regular security updates applied
- [ ] Backup and recovery procedures tested
- [ ] Monitoring and alerting configured
- [ ] Access logs reviewed regularly
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured

## Support and Maintenance

### Monitoring Checklist

- [ ] Application health checks passing
- [ ] Database performance within normal ranges
- [ ] SSL certificates valid and not expiring soon
- [ ] Backup processes running successfully
- [ ] Log aggregation working properly
- [ ] Monitoring alerts configured
- [ ] Security scans completed

### Regular Tasks

- **Daily**: Check monitoring dashboards, review error logs
- **Weekly**: Review security logs, check backup integrity
- **Monthly**: Update system packages, review performance metrics
- **Quarterly**: Security audit, disaster recovery testing
- **Annually**: SSL certificate renewal, comprehensive security review

For additional support, refer to the troubleshooting section or contact the development team.
