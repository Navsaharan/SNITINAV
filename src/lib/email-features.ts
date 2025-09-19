// Advanced Email Features Service

export interface EmailRule {
  id: string
  name: string
  enabled: boolean
  priority: number
  conditions: Array<{
    field: 'from' | 'to' | 'subject' | 'body' | 'attachment' | 'size'
    operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'regex' | 'greaterThan' | 'lessThan'
    value: string | number
    caseSensitive?: boolean
  }>
  actions: Array<{
    type: 'move' | 'copy' | 'delete' | 'forward' | 'reply' | 'flag' | 'label' | 'block'
    target?: string
    template?: string
    parameters?: Record<string, any>
  }>
  createdAt: Date
  updatedAt: Date
}

export interface EmailFilter {
  id: string
  name: string
  type: 'spam' | 'whitelist' | 'blacklist' | 'custom'
  enabled: boolean
  criteria: {
    senders?: string[]
    domains?: string[]
    keywords?: string[]
    patterns?: string[]
  }
  action: 'allow' | 'block' | 'quarantine' | 'flag'
  createdAt: Date
}

export interface AutoResponder {
  id: string
  name: string
  enabled: boolean
  conditions: {
    dateRange?: { start: Date; end: Date }
    senders?: string[]
    subjects?: string[]
    onlyFirstTime?: boolean
  }
  response: {
    subject: string
    body: string
    attachments?: Array<{ filename: string; content: string }>
  }
  settings: {
    maxResponsesPerDay?: number
    cooldownHours?: number
    excludeInternalEmails?: boolean
  }
  createdAt: Date
  stats: {
    totalSent: number
    lastSent?: Date
  }
}

export interface EmailForwarding {
  id: string
  enabled: boolean
  conditions: {
    fromAddresses?: string[]
    toAddresses?: string[]
    subjects?: string[]
    keywords?: string[]
  }
  forwardTo: string[]
  settings: {
    keepOriginal: boolean
    addForwardingHeader: boolean
    preserveAttachments: boolean
  }
  createdAt: Date
  stats: {
    totalForwarded: number
    lastForwarded?: Date
  }
}

// Email Rules Engine
export class EmailRulesEngine {
  private rules: EmailRule[] = []

  constructor(rules: EmailRule[] = []) {
    this.rules = rules.sort((a, b) => a.priority - b.priority)
  }

  async processEmail(email: {
    id: string
    from: string
    to: string[]
    subject: string
    body: string
    attachments?: Array<{ filename: string; size: number }>
    size: number
  }): Promise<{
    processed: boolean
    appliedRules: string[]
    actions: Array<{ rule: string; action: any; result: any }>
  }> {
    const appliedRules: string[] = []
    const actions: Array<{ rule: string; action: any; result: any }> = []

    for (const rule of this.rules.filter(r => r.enabled)) {
      if (await this.evaluateConditions(email, rule.conditions)) {
        appliedRules.push(rule.id)
        
        for (const action of rule.actions) {
          const result = await this.executeAction(email, action)
          actions.push({
            rule: rule.id,
            action,
            result
          })
        }
      }
    }

    return {
      processed: appliedRules.length > 0,
      appliedRules,
      actions
    }
  }

  private async evaluateConditions(email: any, conditions: EmailRule['conditions']): Promise<boolean> {
    // All conditions must be true (AND logic)
    for (const condition of conditions) {
      if (!await this.evaluateCondition(email, condition)) {
        return false
      }
    }
    return true
  }

  private async evaluateCondition(email: any, condition: EmailRule['conditions'][0]): Promise<boolean> {
    let fieldValue: string | number

    switch (condition.field) {
      case 'from':
        fieldValue = email.from
        break
      case 'to':
        fieldValue = email.to.join(', ')
        break
      case 'subject':
        fieldValue = email.subject
        break
      case 'body':
        fieldValue = email.body
        break
      case 'attachment':
        fieldValue = email.attachments?.map((a: any) => a.filename).join(', ') || ''
        break
      case 'size':
        fieldValue = email.size
        break
      default:
        return false
    }

    return this.compareValues(fieldValue, condition.operator, condition.value, condition.caseSensitive)
  }

  private compareValues(
    fieldValue: string | number,
    operator: string,
    conditionValue: string | number,
    caseSensitive = false
  ): boolean {
    if (typeof fieldValue === 'string' && typeof conditionValue === 'string') {
      const field = caseSensitive ? fieldValue : fieldValue.toLowerCase()
      const value = caseSensitive ? conditionValue : conditionValue.toLowerCase()

      switch (operator) {
        case 'contains':
          return field.includes(value)
        case 'equals':
          return field === value
        case 'startsWith':
          return field.startsWith(value)
        case 'endsWith':
          return field.endsWith(value)
        case 'regex':
          try {
            const regex = new RegExp(value, caseSensitive ? 'g' : 'gi')
            return regex.test(field)
          } catch {
            return false
          }
        default:
          return false
      }
    }

    if (typeof fieldValue === 'number' && typeof conditionValue === 'number') {
      switch (operator) {
        case 'equals':
          return fieldValue === conditionValue
        case 'greaterThan':
          return fieldValue > conditionValue
        case 'lessThan':
          return fieldValue < conditionValue
        default:
          return false
      }
    }

    return false
  }

  private async executeAction(email: any, action: EmailRule['actions'][0]): Promise<any> {
    switch (action.type) {
      case 'move':
        return this.moveEmail(email, action.target!)
      case 'copy':
        return this.copyEmail(email, action.target!)
      case 'delete':
        return this.deleteEmail(email)
      case 'forward':
        return this.forwardEmail(email, action.target!)
      case 'reply':
        return this.replyToEmail(email, action.template!)
      case 'flag':
        return this.flagEmail(email, action.parameters)
      case 'label':
        return this.labelEmail(email, action.target!)
      case 'block':
        return this.blockSender(email)
      default:
        return { success: false, error: 'Unknown action type' }
    }
  }

  private async moveEmail(email: any, folder: string): Promise<any> {
    // In production, this would move the email to the specified folder
    return {
      success: true,
      action: 'move',
      folder,
      emailId: email.id
    }
  }

  private async copyEmail(email: any, folder: string): Promise<any> {
    return {
      success: true,
      action: 'copy',
      folder,
      emailId: email.id
    }
  }

  private async deleteEmail(email: any): Promise<any> {
    return {
      success: true,
      action: 'delete',
      emailId: email.id
    }
  }

  private async forwardEmail(email: any, recipient: string): Promise<any> {
    return {
      success: true,
      action: 'forward',
      recipient,
      emailId: email.id
    }
  }

  private async replyToEmail(email: any, template: string): Promise<any> {
    return {
      success: true,
      action: 'reply',
      template,
      emailId: email.id
    }
  }

  private async flagEmail(email: any, parameters: any): Promise<any> {
    return {
      success: true,
      action: 'flag',
      flag: parameters?.flag || 'important',
      emailId: email.id
    }
  }

  private async labelEmail(email: any, label: string): Promise<any> {
    return {
      success: true,
      action: 'label',
      label,
      emailId: email.id
    }
  }

  private async blockSender(email: any): Promise<any> {
    return {
      success: true,
      action: 'block',
      sender: email.from,
      emailId: email.id
    }
  }
}

// Email Filter Service
export class EmailFilterService {
  private filters: EmailFilter[] = []

  constructor(filters: EmailFilter[] = []) {
    this.filters = filters.filter(f => f.enabled)
  }

  async filterEmail(email: {
    from: string
    to: string[]
    subject: string
    body: string
  }): Promise<{
    allowed: boolean
    action: 'allow' | 'block' | 'quarantine' | 'flag'
    matchedFilters: string[]
    reason?: string
  }> {
    const matchedFilters: string[] = []
    let finalAction: 'allow' | 'block' | 'quarantine' | 'flag' = 'allow'
    let reason: string | undefined

    for (const filter of this.filters) {
      if (await this.matchesFilter(email, filter)) {
        matchedFilters.push(filter.id)
        
        // Priority: block > quarantine > flag > allow
        if (filter.action === 'block' || 
           (filter.action === 'quarantine' && finalAction !== 'block') ||
           (filter.action === 'flag' && !['block', 'quarantine'].includes(finalAction))) {
          finalAction = filter.action
          reason = `Matched filter: ${filter.name}`
        }
      }
    }

    return {
      allowed: finalAction === 'allow',
      action: finalAction,
      matchedFilters,
      reason
    }
  }

  private async matchesFilter(email: any, filter: EmailFilter): Promise<boolean> {
    const { criteria } = filter
    const fromDomain = email.from.split('@')[1]

    // Check senders
    if (criteria.senders && criteria.senders.some(sender => 
      email.from.toLowerCase().includes(sender.toLowerCase())
    )) {
      return true
    }

    // Check domains
    if (criteria.domains && criteria.domains.some(domain => 
      fromDomain.toLowerCase().includes(domain.toLowerCase())
    )) {
      return true
    }

    // Check keywords in subject and body
    if (criteria.keywords) {
      const content = (email.subject + ' ' + email.body).toLowerCase()
      if (criteria.keywords.some(keyword => 
        content.includes(keyword.toLowerCase())
      )) {
        return true
      }
    }

    // Check regex patterns
    if (criteria.patterns) {
      const content = email.subject + ' ' + email.body
      for (const pattern of criteria.patterns) {
        try {
          const regex = new RegExp(pattern, 'i')
          if (regex.test(content)) {
            return true
          }
        } catch {
          // Invalid regex, skip
        }
      }
    }

    return false
  }
}

// Auto-Responder Service
export class AutoResponderService {
  private responders: AutoResponder[] = []
  private responseLog: Map<string, { count: number; lastSent: Date }> = new Map()

  constructor(responders: AutoResponder[] = []) {
    this.responders = responders.filter(r => r.enabled)
  }

  async processEmail(email: {
    from: string
    to: string[]
    subject: string
    body: string
    receivedAt: Date
  }): Promise<{
    shouldRespond: boolean
    responses: Array<{
      responderId: string
      response: AutoResponder['response']
      reason?: string
    }>
  }> {
    const responses: Array<{
      responderId: string
      response: AutoResponder['response']
      reason?: string
    }> = []

    for (const responder of this.responders) {
      const shouldRespond = await this.shouldSendResponse(email, responder)
      
      if (shouldRespond.should) {
        responses.push({
          responderId: responder.id,
          response: responder.response
        })

        // Update response log
        const key = `${responder.id}:${email.from}`
        const current = this.responseLog.get(key) || { count: 0, lastSent: new Date(0) }
        this.responseLog.set(key, {
          count: current.count + 1,
          lastSent: new Date()
        })
      }
    }

    return {
      shouldRespond: responses.length > 0,
      responses
    }
  }

  private async shouldSendResponse(email: any, responder: AutoResponder): Promise<{
    should: boolean
    reason?: string
  }> {
    const { conditions, settings } = responder

    // Check date range
    if (conditions.dateRange) {
      const now = email.receivedAt
      if (now < conditions.dateRange.start || now > conditions.dateRange.end) {
        return { should: false, reason: 'Outside date range' }
      }
    }

    // Check sender conditions
    if (conditions.senders && conditions.senders.length > 0) {
      if (!conditions.senders.some(sender => 
        email.from.toLowerCase().includes(sender.toLowerCase())
      )) {
        return { should: false, reason: 'Sender not in list' }
      }
    }

    // Check subject conditions
    if (conditions.subjects && conditions.subjects.length > 0) {
      if (!conditions.subjects.some(subject => 
        email.subject.toLowerCase().includes(subject.toLowerCase())
      )) {
        return { should: false, reason: 'Subject does not match' }
      }
    }

    // Check if this is an internal email and should be excluded
    if (settings.excludeInternalEmails && email.from.endsWith('@institute.edu')) {
      return { should: false, reason: 'Internal email excluded' }
    }

    // Check response limits
    const key = `${responder.id}:${email.from}`
    const responseHistory = this.responseLog.get(key)

    if (responseHistory) {
      // Check cooldown period
      if (settings.cooldownHours) {
        const hoursSinceLastResponse = (Date.now() - responseHistory.lastSent.getTime()) / (1000 * 60 * 60)
        if (hoursSinceLastResponse < settings.cooldownHours) {
          return { should: false, reason: 'Cooldown period active' }
        }
      }

      // Check daily limit
      if (settings.maxResponsesPerDay) {
        const today = new Date().toDateString()
        const lastSentToday = responseHistory.lastSent.toDateString() === today
        
        if (lastSentToday && responseHistory.count >= settings.maxResponsesPerDay) {
          return { should: false, reason: 'Daily limit reached' }
        }
      }

      // Check first-time only setting
      if (conditions.onlyFirstTime && responseHistory.count > 0) {
        return { should: false, reason: 'Already responded to this sender' }
      }
    }

    return { should: true }
  }
}

// Email Forwarding Service
export class EmailForwardingService {
  private forwardingRules: EmailForwarding[] = []

  constructor(rules: EmailForwarding[] = []) {
    this.forwardingRules = rules.filter(r => r.enabled)
  }

  async processEmail(email: {
    id: string
    from: string
    to: string[]
    subject: string
    body: string
    attachments?: Array<{ filename: string; content: string }>
  }): Promise<{
    shouldForward: boolean
    forwardingActions: Array<{
      ruleId: string
      forwardTo: string[]
      settings: EmailForwarding['settings']
    }>
  }> {
    const forwardingActions: Array<{
      ruleId: string
      forwardTo: string[]
      settings: EmailForwarding['settings']
    }> = []

    for (const rule of this.forwardingRules) {
      if (await this.matchesForwardingConditions(email, rule.conditions)) {
        forwardingActions.push({
          ruleId: rule.id,
          forwardTo: rule.forwardTo,
          settings: rule.settings
        })
      }
    }

    return {
      shouldForward: forwardingActions.length > 0,
      forwardingActions
    }
  }

  private async matchesForwardingConditions(email: any, conditions: EmailForwarding['conditions']): Promise<boolean> {
    // Check from addresses
    if (conditions.fromAddresses && conditions.fromAddresses.length > 0) {
      if (!conditions.fromAddresses.some(addr => 
        email.from.toLowerCase().includes(addr.toLowerCase())
      )) {
        return false
      }
    }

    // Check to addresses
    if (conditions.toAddresses && conditions.toAddresses.length > 0) {
      if (!conditions.toAddresses.some(addr => 
        email.to.some((to: string) => to.toLowerCase().includes(addr.toLowerCase()))
      )) {
        return false
      }
    }

    // Check subjects
    if (conditions.subjects && conditions.subjects.length > 0) {
      if (!conditions.subjects.some(subject => 
        email.subject.toLowerCase().includes(subject.toLowerCase())
      )) {
        return false
      }
    }

    // Check keywords
    if (conditions.keywords && conditions.keywords.length > 0) {
      const content = (email.subject + ' ' + email.body).toLowerCase()
      if (!conditions.keywords.some(keyword => 
        content.includes(keyword.toLowerCase())
      )) {
        return false
      }
    }

    return true
  }

  async createForwardedEmail(
    originalEmail: any,
    forwardTo: string[],
    settings: EmailForwarding['settings']
  ): Promise<any> {
    const forwardedEmail = {
      to: forwardTo,
      subject: settings.addForwardingHeader 
        ? `Fwd: ${originalEmail.subject}`
        : originalEmail.subject,
      body: this.createForwardedBody(originalEmail, settings),
      attachments: settings.preserveAttachments ? originalEmail.attachments : undefined,
      headers: {
        'X-Forwarded-From': originalEmail.from,
        'X-Original-Message-ID': originalEmail.id
      }
    }

    return forwardedEmail
  }

  private createForwardedBody(originalEmail: any, settings: EmailForwarding['settings']): string {
    if (!settings.addForwardingHeader) {
      return originalEmail.body
    }

    const forwardingHeader = `
---------- Forwarded message ----------
From: ${originalEmail.from}
Date: ${new Date().toLocaleString()}
Subject: ${originalEmail.subject}
To: ${originalEmail.to.join(', ')}

`

    return forwardingHeader + originalEmail.body
  }
}
