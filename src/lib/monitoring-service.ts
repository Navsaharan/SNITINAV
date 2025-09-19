// System Monitoring & Analytics Service

export interface SystemMetrics {
  timestamp: Date
  cpu: {
    usage: number
    cores: number
    loadAverage: number[]
  }
  memory: {
    total: number
    used: number
    free: number
    usagePercentage: number
  }
  disk: {
    total: number
    used: number
    free: number
    usagePercentage: number
  }
  network: {
    bytesIn: number
    bytesOut: number
    packetsIn: number
    packetsOut: number
  }
  processes: {
    total: number
    running: number
    sleeping: number
    zombie: number
  }
}

export interface EmailMetrics {
  timestamp: Date
  smtp: {
    totalConnections: number
    activeConnections: number
    emailsSent: number
    emailsFailed: number
    averageResponseTime: number
    throughput: number
  }
  imap: {
    totalConnections: number
    activeConnections: number
    commandsProcessed: number
    commandsFailed: number
    averageResponseTime: number
  }
  pop3: {
    totalConnections: number
    activeConnections: number
    commandsProcessed: number
    commandsFailed: number
    averageResponseTime: number
  }
  storage: {
    totalEmails: number
    totalSize: number
    attachmentSize: number
    indexSize: number
  }
}

export interface SecurityMetrics {
  timestamp: Date
  threats: {
    spamBlocked: number
    virusesDetected: number
    phishingAttempts: number
    suspiciousActivity: number
  }
  authentication: {
    successfulLogins: number
    failedLogins: number
    blockedIPs: number
    activeSessions: number
  }
  compliance: {
    violations: number
    dataExports: number
    auditEvents: number
    encryptedEmails: number
  }
}

export interface PerformanceAnalytics {
  timeRange: { start: Date; end: Date }
  emailVolume: Array<{
    timestamp: Date
    sent: number
    received: number
    failed: number
  }>
  responseTime: Array<{
    timestamp: Date
    smtp: number
    imap: number
    pop3: number
    web: number
  }>
  errorRates: Array<{
    timestamp: Date
    smtp: number
    imap: number
    pop3: number
    web: number
  }>
  resourceUsage: Array<{
    timestamp: Date
    cpu: number
    memory: number
    disk: number
    network: number
  }>
}

export interface AlertRule {
  id: string
  name: string
  enabled: boolean
  metric: string
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals'
  threshold: number
  duration: number // minutes
  severity: 'low' | 'medium' | 'high' | 'critical'
  actions: Array<{
    type: 'email' | 'webhook' | 'log'
    target: string
    template?: string
  }>
  lastTriggered?: Date
  triggerCount: number
}

export interface MonitoringReport {
  id: string
  name: string
  type: 'daily' | 'weekly' | 'monthly' | 'custom'
  schedule: string // cron expression
  enabled: boolean
  recipients: string[]
  sections: Array<{
    type: 'system' | 'email' | 'security' | 'performance'
    metrics: string[]
    charts: string[]
  }>
  lastGenerated?: Date
  nextScheduled?: Date
}

// Monitoring Service Class
export class MonitoringService {
  private metricsHistory: Map<string, any[]> = new Map()
  private alertRules: AlertRule[] = []

  constructor() {
    // Initialize with some default alert rules
    this.alertRules = [
      {
        id: 'cpu-high',
        name: 'High CPU Usage',
        enabled: true,
        metric: 'cpu.usage',
        condition: 'greater_than',
        threshold: 80,
        duration: 5,
        severity: 'high',
        actions: [{ type: 'email', target: 'admin@institute.edu' }],
        triggerCount: 0
      },
      {
        id: 'memory-high',
        name: 'High Memory Usage',
        enabled: true,
        metric: 'memory.usagePercentage',
        condition: 'greater_than',
        threshold: 85,
        duration: 3,
        severity: 'high',
        actions: [{ type: 'email', target: 'admin@institute.edu' }],
        triggerCount: 0
      },
      {
        id: 'disk-full',
        name: 'Disk Space Critical',
        enabled: true,
        metric: 'disk.usagePercentage',
        condition: 'greater_than',
        threshold: 90,
        duration: 1,
        severity: 'critical',
        actions: [{ type: 'email', target: 'admin@institute.edu' }],
        triggerCount: 0
      }
    ]
  }

  // Collect current system metrics
  async collectSystemMetrics(): Promise<SystemMetrics> {
    // In production, this would collect real system metrics
    const metrics: SystemMetrics = {
      timestamp: new Date(),
      cpu: {
        usage: Math.random() * 100,
        cores: 4,
        loadAverage: [1.2, 1.5, 1.8]
      },
      memory: {
        total: 8 * 1024 * 1024 * 1024, // 8GB
        used: Math.random() * 6 * 1024 * 1024 * 1024, // Random usage up to 6GB
        free: 0,
        usagePercentage: 0
      },
      disk: {
        total: 100 * 1024 * 1024 * 1024, // 100GB
        used: Math.random() * 80 * 1024 * 1024 * 1024, // Random usage up to 80GB
        free: 0,
        usagePercentage: 0
      },
      network: {
        bytesIn: Math.random() * 1000000,
        bytesOut: Math.random() * 1000000,
        packetsIn: Math.random() * 10000,
        packetsOut: Math.random() * 10000
      },
      processes: {
        total: 150 + Math.floor(Math.random() * 50),
        running: 5 + Math.floor(Math.random() * 10),
        sleeping: 140 + Math.floor(Math.random() * 40),
        zombie: Math.floor(Math.random() * 3)
      }
    }

    // Calculate derived values
    metrics.memory.free = metrics.memory.total - metrics.memory.used
    metrics.memory.usagePercentage = (metrics.memory.used / metrics.memory.total) * 100

    metrics.disk.free = metrics.disk.total - metrics.disk.used
    metrics.disk.usagePercentage = (metrics.disk.used / metrics.disk.total) * 100

    // Store in history
    this.storeMetrics('system', metrics)

    return metrics
  }

  // Collect email system metrics
  async collectEmailMetrics(): Promise<EmailMetrics> {
    const metrics: EmailMetrics = {
      timestamp: new Date(),
      smtp: {
        totalConnections: 1250 + Math.floor(Math.random() * 100),
        activeConnections: 5 + Math.floor(Math.random() * 15),
        emailsSent: 980 + Math.floor(Math.random() * 200),
        emailsFailed: Math.floor(Math.random() * 10),
        averageResponseTime: 120 + Math.random() * 80,
        throughput: 45 + Math.random() * 20
      },
      imap: {
        totalConnections: 890 + Math.floor(Math.random() * 100),
        activeConnections: 12 + Math.floor(Math.random() * 20),
        commandsProcessed: 5600 + Math.floor(Math.random() * 1000),
        commandsFailed: Math.floor(Math.random() * 20),
        averageResponseTime: 85 + Math.random() * 40
      },
      pop3: {
        totalConnections: 340 + Math.floor(Math.random() * 50),
        activeConnections: 3 + Math.floor(Math.random() * 8),
        commandsProcessed: 1200 + Math.floor(Math.random() * 300),
        commandsFailed: Math.floor(Math.random() * 5),
        averageResponseTime: 95 + Math.random() * 30
      },
      storage: {
        totalEmails: 125000 + Math.floor(Math.random() * 5000),
        totalSize: 15.6 * 1024 * 1024 * 1024 + Math.random() * 1024 * 1024 * 1024,
        attachmentSize: 8.2 * 1024 * 1024 * 1024 + Math.random() * 512 * 1024 * 1024,
        indexSize: 256 * 1024 * 1024 + Math.random() * 64 * 1024 * 1024
      }
    }

    this.storeMetrics('email', metrics)
    return metrics
  }

  // Collect security metrics
  async collectSecurityMetrics(): Promise<SecurityMetrics> {
    const metrics: SecurityMetrics = {
      timestamp: new Date(),
      threats: {
        spamBlocked: 2340 + Math.floor(Math.random() * 100),
        virusesDetected: 89 + Math.floor(Math.random() * 10),
        phishingAttempts: 156 + Math.floor(Math.random() * 20),
        suspiciousActivity: 45 + Math.floor(Math.random() * 15)
      },
      authentication: {
        successfulLogins: 1180 + Math.floor(Math.random() * 50),
        failedLogins: 23 + Math.floor(Math.random() * 10),
        blockedIPs: 12 + Math.floor(Math.random() * 5),
        activeSessions: 145 + Math.floor(Math.random() * 30)
      },
      compliance: {
        violations: 12 + Math.floor(Math.random() * 5),
        dataExports: 8 + Math.floor(Math.random() * 3),
        auditEvents: 450 + Math.floor(Math.random() * 50),
        encryptedEmails: 234 + Math.floor(Math.random() * 30)
      }
    }

    this.storeMetrics('security', metrics)
    return metrics
  }

  // Store metrics in history
  private storeMetrics(type: string, metrics: any): void {
    if (!this.metricsHistory.has(type)) {
      this.metricsHistory.set(type, [])
    }

    const history = this.metricsHistory.get(type)!
    history.push(metrics)

    // Keep only last 1000 entries
    if (history.length > 1000) {
      history.shift()
    }
  }

  // Get performance analytics for a time range
  async getPerformanceAnalytics(
    startDate: Date,
    endDate: Date,
    granularity: 'minute' | 'hour' | 'day' = 'hour'
  ): Promise<PerformanceAnalytics> {
    // In production, this would query historical data from database
    const dataPoints = this.generateTimeSeriesData(startDate, endDate, granularity)

    return {
      timeRange: { start: startDate, end: endDate },
      emailVolume: dataPoints.map(point => ({
        timestamp: point.timestamp,
        sent: 50 + Math.floor(Math.random() * 100),
        received: 40 + Math.floor(Math.random() * 80),
        failed: Math.floor(Math.random() * 5)
      })),
      responseTime: dataPoints.map(point => ({
        timestamp: point.timestamp,
        smtp: 120 + Math.random() * 80,
        imap: 85 + Math.random() * 40,
        pop3: 95 + Math.random() * 30,
        web: 200 + Math.random() * 100
      })),
      errorRates: dataPoints.map(point => ({
        timestamp: point.timestamp,
        smtp: Math.random() * 2,
        imap: Math.random() * 1.5,
        pop3: Math.random() * 1,
        web: Math.random() * 3
      })),
      resourceUsage: dataPoints.map(point => ({
        timestamp: point.timestamp,
        cpu: 20 + Math.random() * 60,
        memory: 40 + Math.random() * 40,
        disk: 60 + Math.random() * 20,
        network: 10 + Math.random() * 30
      }))
    }
  }

  // Generate time series data points
  private generateTimeSeriesData(
    startDate: Date,
    endDate: Date,
    granularity: 'minute' | 'hour' | 'day'
  ): Array<{ timestamp: Date }> {
    const points: Array<{ timestamp: Date }> = []
    const interval = granularity === 'minute' ? 60000 : 
                    granularity === 'hour' ? 3600000 : 86400000

    let current = new Date(startDate)
    while (current <= endDate) {
      points.push({ timestamp: new Date(current) })
      current = new Date(current.getTime() + interval)
    }

    return points
  }

  // Check alert rules against current metrics
  async checkAlertRules(metrics: SystemMetrics | EmailMetrics | SecurityMetrics): Promise<{
    triggeredAlerts: Array<{
      rule: AlertRule
      currentValue: number
      message: string
    }>
  }> {
    const triggeredAlerts: Array<{
      rule: AlertRule
      currentValue: number
      message: string
    }> = []

    for (const rule of this.alertRules.filter(r => r.enabled)) {
      const currentValue = this.getMetricValue(metrics, rule.metric)
      
      if (this.evaluateCondition(currentValue, rule.condition, rule.threshold)) {
        triggeredAlerts.push({
          rule,
          currentValue,
          message: `${rule.name}: ${rule.metric} is ${currentValue} (threshold: ${rule.threshold})`
        })

        // Update rule statistics
        rule.lastTriggered = new Date()
        rule.triggerCount++
      }
    }

    return { triggeredAlerts }
  }

  // Extract metric value from metrics object
  private getMetricValue(metrics: any, metricPath: string): number {
    const parts = metricPath.split('.')
    let value = metrics

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part]
      } else {
        return 0
      }
    }

    return typeof value === 'number' ? value : 0
  }

  // Evaluate alert condition
  private evaluateCondition(value: number, condition: string, threshold: number): boolean {
    switch (condition) {
      case 'greater_than':
        return value > threshold
      case 'less_than':
        return value < threshold
      case 'equals':
        return value === threshold
      case 'not_equals':
        return value !== threshold
      default:
        return false
    }
  }

  // Generate monitoring report
  async generateReport(reportConfig: MonitoringReport): Promise<{
    report: string
    data: any
    generatedAt: Date
  }> {
    const now = new Date()
    const data: any = {}

    // Collect data for each section
    for (const section of reportConfig.sections) {
      switch (section.type) {
        case 'system':
          data.system = await this.collectSystemMetrics()
          break
        case 'email':
          data.email = await this.collectEmailMetrics()
          break
        case 'security':
          data.security = await this.collectSecurityMetrics()
          break
        case 'performance':
          const endDate = new Date()
          const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000) // Last 24 hours
          data.performance = await this.getPerformanceAnalytics(startDate, endDate)
          break
      }
    }

    // Generate report text
    const report = this.formatReport(reportConfig, data, now)

    return {
      report,
      data,
      generatedAt: now
    }
  }

  // Format report as text
  private formatReport(config: MonitoringReport, data: any, generatedAt: Date): string {
    let report = `# ${config.name}\n\n`
    report += `**Generated**: ${generatedAt.toISOString()}\n`
    report += `**Type**: ${config.type}\n\n`

    if (data.system) {
      report += `## System Metrics\n`
      report += `- CPU Usage: ${data.system.cpu.usage.toFixed(1)}%\n`
      report += `- Memory Usage: ${data.system.memory.usagePercentage.toFixed(1)}%\n`
      report += `- Disk Usage: ${data.system.disk.usagePercentage.toFixed(1)}%\n`
      report += `- Active Processes: ${data.system.processes.running}\n\n`
    }

    if (data.email) {
      report += `## Email System\n`
      report += `- SMTP Connections: ${data.email.smtp.activeConnections}\n`
      report += `- Emails Sent: ${data.email.smtp.emailsSent}\n`
      report += `- IMAP Connections: ${data.email.imap.activeConnections}\n`
      report += `- POP3 Connections: ${data.email.pop3.activeConnections}\n\n`
    }

    if (data.security) {
      report += `## Security\n`
      report += `- Spam Blocked: ${data.security.threats.spamBlocked}\n`
      report += `- Viruses Detected: ${data.security.threats.virusesDetected}\n`
      report += `- Failed Logins: ${data.security.authentication.failedLogins}\n`
      report += `- Compliance Violations: ${data.security.compliance.violations}\n\n`
    }

    return report
  }

  // Get alert rules
  getAlertRules(): AlertRule[] {
    return this.alertRules
  }

  // Add or update alert rule
  setAlertRule(rule: AlertRule): void {
    const index = this.alertRules.findIndex(r => r.id === rule.id)
    if (index >= 0) {
      this.alertRules[index] = rule
    } else {
      this.alertRules.push(rule)
    }
  }

  // Delete alert rule
  deleteAlertRule(ruleId: string): boolean {
    const index = this.alertRules.findIndex(r => r.id === ruleId)
    if (index >= 0) {
      this.alertRules.splice(index, 1)
      return true
    }
    return false
  }
}
