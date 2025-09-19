// IMAP Test Client for validating protocol implementation

export interface IMAPTestResult {
  success: boolean
  steps: Array<{
    command: string
    expected: string
    actual: string
    success: boolean
    responses: any[]
    duration: number
  }>
  totalDuration: number
  errors: string[]
}

export interface IMAPTestConfig {
  baseUrl: string
  username: string
  password: string
  testMailbox?: string
}

export class IMAPTestClient {
  private baseUrl: string
  private sessionId?: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '') // Remove trailing slash
  }

  // Run comprehensive IMAP test
  async runFullTest(config: IMAPTestConfig): Promise<IMAPTestResult> {
    const startTime = Date.now()
    const result: IMAPTestResult = {
      success: true,
      steps: [],
      totalDuration: 0,
      errors: []
    }

    try {
      // Test sequence
      await this.testConnect(result)
      await this.testCapability(result)
      await this.testLogin(result, config.username, config.password)
      await this.testList(result)
      await this.testSelect(result, config.testMailbox || 'INBOX')
      await this.testFetch(result, '1:5')
      await this.testSearch(result, ['ALL'])
      await this.testStore(result, '1', '+FLAGS', ['\\Seen'])
      await this.testLogout(result)

    } catch (error) {
      result.success = false
      result.errors.push(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    result.totalDuration = Date.now() - startTime
    result.success = result.success && result.steps.every(step => step.success)

    return result
  }

  // Test individual IMAP commands
  async testConnect(result: IMAPTestResult): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await fetch(`${this.baseUrl}/api/imap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      const data = await response.json()
      this.sessionId = data.sessionId

      result.steps.push({
        command: 'CONNECT',
        expected: 'OK',
        actual: data.responses[0]?.status || 'ERROR',
        success: data.responses[0]?.status === 'OK',
        responses: data.responses,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: 'CONNECT',
        expected: 'OK',
        actual: 'ERROR',
        success: false,
        responses: [],
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  async testCapability(result: IMAPTestResult): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand('A001 CAPABILITY')
      
      result.steps.push({
        command: 'A001 CAPABILITY',
        expected: 'OK',
        actual: this.getTaggedResponse(response.responses, 'A001')?.status || 'ERROR',
        success: this.getTaggedResponse(response.responses, 'A001')?.status === 'OK',
        responses: response.responses,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: 'A001 CAPABILITY',
        expected: 'OK',
        actual: 'ERROR',
        success: false,
        responses: [],
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  async testLogin(result: IMAPTestResult, username: string, password: string): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand(`A002 LOGIN ${username} ${password}`)
      
      result.steps.push({
        command: `A002 LOGIN ${username} ****`,
        expected: 'OK',
        actual: this.getTaggedResponse(response.responses, 'A002')?.status || 'ERROR',
        success: this.getTaggedResponse(response.responses, 'A002')?.status === 'OK',
        responses: response.responses,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: `A002 LOGIN ${username} ****`,
        expected: 'OK',
        actual: 'ERROR',
        success: false,
        responses: [],
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  async testList(result: IMAPTestResult): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand('A003 LIST "" "*"')
      
      result.steps.push({
        command: 'A003 LIST "" "*"',
        expected: 'OK',
        actual: this.getTaggedResponse(response.responses, 'A003')?.status || 'ERROR',
        success: this.getTaggedResponse(response.responses, 'A003')?.status === 'OK',
        responses: response.responses,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: 'A003 LIST "" "*"',
        expected: 'OK',
        actual: 'ERROR',
        success: false,
        responses: [],
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  async testSelect(result: IMAPTestResult, mailbox: string): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand(`A004 SELECT ${mailbox}`)
      
      result.steps.push({
        command: `A004 SELECT ${mailbox}`,
        expected: 'OK',
        actual: this.getTaggedResponse(response.responses, 'A004')?.status || 'ERROR',
        success: this.getTaggedResponse(response.responses, 'A004')?.status === 'OK',
        responses: response.responses,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: `A004 SELECT ${mailbox}`,
        expected: 'OK',
        actual: 'ERROR',
        success: false,
        responses: [],
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  async testFetch(result: IMAPTestResult, sequence: string): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand(`A005 FETCH ${sequence} (FLAGS UID)`)
      
      result.steps.push({
        command: `A005 FETCH ${sequence} (FLAGS UID)`,
        expected: 'OK',
        actual: this.getTaggedResponse(response.responses, 'A005')?.status || 'ERROR',
        success: this.getTaggedResponse(response.responses, 'A005')?.status === 'OK',
        responses: response.responses,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: `A005 FETCH ${sequence} (FLAGS UID)`,
        expected: 'OK',
        actual: 'ERROR',
        success: false,
        responses: [],
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  async testSearch(result: IMAPTestResult, criteria: string[]): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand(`A006 SEARCH ${criteria.join(' ')}`)
      
      result.steps.push({
        command: `A006 SEARCH ${criteria.join(' ')}`,
        expected: 'OK',
        actual: this.getTaggedResponse(response.responses, 'A006')?.status || 'ERROR',
        success: this.getTaggedResponse(response.responses, 'A006')?.status === 'OK',
        responses: response.responses,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: `A006 SEARCH ${criteria.join(' ')}`,
        expected: 'OK',
        actual: 'ERROR',
        success: false,
        responses: [],
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  async testStore(result: IMAPTestResult, sequence: string, flags: string, flagList: string[]): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand(`A007 STORE ${sequence} ${flags} (${flagList.join(' ')})`)
      
      result.steps.push({
        command: `A007 STORE ${sequence} ${flags} (${flagList.join(' ')})`,
        expected: 'OK',
        actual: this.getTaggedResponse(response.responses, 'A007')?.status || 'ERROR',
        success: this.getTaggedResponse(response.responses, 'A007')?.status === 'OK',
        responses: response.responses,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: `A007 STORE ${sequence} ${flags} (${flagList.join(' ')})`,
        expected: 'OK',
        actual: 'ERROR',
        success: false,
        responses: [],
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  async testLogout(result: IMAPTestResult): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand('A008 LOGOUT')
      
      result.steps.push({
        command: 'A008 LOGOUT',
        expected: 'OK',
        actual: this.getTaggedResponse(response.responses, 'A008')?.status || 'ERROR',
        success: this.getTaggedResponse(response.responses, 'A008')?.status === 'OK',
        responses: response.responses,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: 'A008 LOGOUT',
        expected: 'OK',
        actual: 'ERROR',
        success: false,
        responses: [],
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  // Send IMAP command
  private async sendCommand(command: string): Promise<{ responses: any[] }> {
    const response = await fetch(`${this.baseUrl}/api/imap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: this.sessionId,
        command
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return { responses: data.responses || [] }
  }

  // Get tagged response from responses array
  private getTaggedResponse(responses: any[], tag: string): any {
    return responses.find(r => r.type === 'tagged' && r.tag === tag)
  }

  // Test error conditions
  async testErrorConditions(): Promise<IMAPTestResult> {
    const result: IMAPTestResult = {
      success: true,
      steps: [],
      totalDuration: 0,
      errors: []
    }

    const startTime = Date.now()

    try {
      // Test invalid command
      await this.testInvalidCommand(result)
      
      // Test bad sequence
      await this.testBadSequence(result)
      
      // Test authentication failure
      await this.testAuthFailure(result)

    } catch (error) {
      result.errors.push(`Error test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    result.totalDuration = Date.now() - startTime
    return result
  }

  private async testInvalidCommand(result: IMAPTestResult): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand('A999 INVALID_COMMAND')
      
      result.steps.push({
        command: 'A999 INVALID_COMMAND',
        expected: 'BAD',
        actual: this.getTaggedResponse(response.responses, 'A999')?.status || 'ERROR',
        success: this.getTaggedResponse(response.responses, 'A999')?.status === 'BAD',
        responses: response.responses,
        duration: Date.now() - stepStart
      })
    } catch (error) {
      result.steps.push({
        command: 'A999 INVALID_COMMAND',
        expected: 'BAD',
        actual: 'ERROR',
        success: false,
        responses: [],
        duration: Date.now() - stepStart
      })
    }
  }

  private async testBadSequence(result: IMAPTestResult): Promise<void> {
    const stepStart = Date.now()
    
    try {
      // Try SELECT without authentication
      const response = await this.sendCommand('A998 SELECT INBOX')
      
      result.steps.push({
        command: 'A998 SELECT INBOX (without auth)',
        expected: 'NO',
        actual: this.getTaggedResponse(response.responses, 'A998')?.status || 'ERROR',
        success: this.getTaggedResponse(response.responses, 'A998')?.status === 'NO',
        responses: response.responses,
        duration: Date.now() - stepStart
      })
    } catch (error) {
      result.steps.push({
        command: 'A998 SELECT INBOX (without auth)',
        expected: 'NO',
        actual: 'ERROR',
        success: false,
        responses: [],
        duration: Date.now() - stepStart
      })
    }
  }

  private async testAuthFailure(result: IMAPTestResult): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand('A997 LOGIN invalid@example.com wrongpassword')
      
      result.steps.push({
        command: 'A997 LOGIN invalid@example.com ****',
        expected: 'NO',
        actual: this.getTaggedResponse(response.responses, 'A997')?.status || 'ERROR',
        success: this.getTaggedResponse(response.responses, 'A997')?.status === 'NO',
        responses: response.responses,
        duration: Date.now() - stepStart
      })
    } catch (error) {
      result.steps.push({
        command: 'A997 LOGIN invalid@example.com ****',
        expected: 'NO',
        actual: 'ERROR',
        success: false,
        responses: [],
        duration: Date.now() - stepStart
      })
    }
  }
}

// Utility function to run IMAP tests
export async function runIMAPTests(baseUrl: string, config: IMAPTestConfig): Promise<IMAPTestResult> {
  const client = new IMAPTestClient(baseUrl)
  return await client.runFullTest(config)
}

// Generate test report
export function generateIMAPTestReport(result: IMAPTestResult): string {
  let report = `# IMAP Test Report\n\n`
  report += `**Overall Result**: ${result.success ? '✅ PASSED' : '❌ FAILED'}\n`
  report += `**Total Duration**: ${result.totalDuration}ms\n\n`

  if (result.errors.length > 0) {
    report += `## Errors\n`
    result.errors.forEach(error => {
      report += `- ${error}\n`
    })
    report += `\n`
  }

  report += `## Test Steps\n\n`
  report += `| Command | Expected | Actual | Status | Duration | Responses |\n`
  report += `|---------|----------|--------|--------|----------|----------|\n`

  result.steps.forEach(step => {
    const status = step.success ? '✅' : '❌'
    const responseCount = step.responses.length
    report += `| ${step.command} | ${step.expected} | ${step.actual} | ${status} | ${step.duration}ms | ${responseCount} responses |\n`
  })

  return report
}
