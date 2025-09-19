// SMTP Test Client for validating protocol implementation

export interface SMTPTestResult {
  success: boolean
  steps: Array<{
    command: string
    expected: number
    actual: number
    success: boolean
    message: string
    duration: number
  }>
  totalDuration: number
  errors: string[]
}

export interface SMTPTestConfig {
  baseUrl: string
  from: string
  to: string
  subject: string
  body: string
  username?: string
  password?: string
}

export class SMTPTestClient {
  private baseUrl: string
  private sessionId?: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '') // Remove trailing slash
  }

  // Run comprehensive SMTP test
  async runFullTest(config: SMTPTestConfig): Promise<SMTPTestResult> {
    const startTime = Date.now()
    const result: SMTPTestResult = {
      success: true,
      steps: [],
      totalDuration: 0,
      errors: []
    }

    try {
      // Test sequence
      await this.testConnect(result)
      await this.testHELO(result, 'test-client.example.com')
      
      if (config.username && config.password) {
        await this.testAuth(result, config.username, config.password)
      }
      
      await this.testMAILFROM(result, config.from)
      await this.testRCPTTO(result, config.to)
      await this.testDATA(result)
      await this.testEmailData(result, config.subject, config.body)
      await this.testQUIT(result)

    } catch (error) {
      result.success = false
      result.errors.push(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    result.totalDuration = Date.now() - startTime
    result.success = result.success && result.steps.every(step => step.success)

    return result
  }

  // Test individual SMTP commands
  async testConnect(result: SMTPTestResult): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await fetch(`${this.baseUrl}/api/smtp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      const data = await response.json()
      this.sessionId = data.sessionId

      result.steps.push({
        command: 'CONNECT',
        expected: 220,
        actual: data.response.code,
        success: data.response.code === 220,
        message: data.response.message,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: 'CONNECT',
        expected: 220,
        actual: 0,
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  async testHELO(result: SMTPTestResult, hostname: string): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand(`HELO ${hostname}`)
      
      result.steps.push({
        command: `HELO ${hostname}`,
        expected: 250,
        actual: response.code,
        success: response.code === 250,
        message: response.message,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: `HELO ${hostname}`,
        expected: 250,
        actual: 0,
        success: false,
        message: `HELO failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  async testAuth(result: SMTPTestResult, username: string, password: string): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await fetch(`${this.baseUrl}/api/smtp/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          method: 'PLAIN',
          credentials: {
            username,
            password
          }
        })
      })

      const data = await response.json()
      
      result.steps.push({
        command: 'AUTH PLAIN',
        expected: 250,
        actual: data.response.code,
        success: data.response.code === 250,
        message: data.response.message,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: 'AUTH PLAIN',
        expected: 250,
        actual: 0,
        success: false,
        message: `AUTH failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  async testMAILFROM(result: SMTPTestResult, from: string): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand(`MAIL FROM:<${from}>`)
      
      result.steps.push({
        command: `MAIL FROM:<${from}>`,
        expected: 250,
        actual: response.code,
        success: response.code === 250,
        message: response.message,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: `MAIL FROM:<${from}>`,
        expected: 250,
        actual: 0,
        success: false,
        message: `MAIL FROM failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  async testRCPTTO(result: SMTPTestResult, to: string): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand(`RCPT TO:<${to}>`)
      
      result.steps.push({
        command: `RCPT TO:<${to}>`,
        expected: 250,
        actual: response.code,
        success: response.code === 250,
        message: response.message,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: `RCPT TO:<${to}>`,
        expected: 250,
        actual: 0,
        success: false,
        message: `RCPT TO failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  async testDATA(result: SMTPTestResult): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand('DATA')
      
      result.steps.push({
        command: 'DATA',
        expected: 354,
        actual: response.code,
        success: response.code === 354,
        message: response.message,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: 'DATA',
        expected: 354,
        actual: 0,
        success: false,
        message: `DATA failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  async testEmailData(result: SMTPTestResult, subject: string, body: string): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const emailData = `Subject: ${subject}\r\n\r\n${body}`
      
      const response = await fetch(`${this.baseUrl}/api/smtp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          data: emailData
        })
      })

      const data = await response.json()
      
      result.steps.push({
        command: 'EMAIL DATA',
        expected: 250,
        actual: data.response.code,
        success: data.response.code === 250,
        message: data.response.message,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: 'EMAIL DATA',
        expected: 250,
        actual: 0,
        success: false,
        message: `Email data failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  async testQUIT(result: SMTPTestResult): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand('QUIT')
      
      result.steps.push({
        command: 'QUIT',
        expected: 220,
        actual: response.code,
        success: response.code === 220 || response.code === 221,
        message: response.message,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: 'QUIT',
        expected: 220,
        actual: 0,
        success: false,
        message: `QUIT failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  // Send SMTP command
  private async sendCommand(command: string): Promise<{ code: number; message: string }> {
    const response = await fetch(`${this.baseUrl}/api/smtp`, {
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
    return data.response
  }

  // Test EHLO command and capabilities
  async testEHLO(hostname: string): Promise<{ success: boolean; capabilities: string[] }> {
    try {
      const response = await this.sendCommand(`EHLO ${hostname}`)
      
      if (response.code === 250) {
        const capabilities = response.message.split('\n').slice(1) // Skip first line
        return { success: true, capabilities }
      }
      
      return { success: false, capabilities: [] }
    } catch (error) {
      return { success: false, capabilities: [] }
    }
  }

  // Test various error conditions
  async testErrorConditions(): Promise<SMTPTestResult> {
    const result: SMTPTestResult = {
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
      
      // Test invalid email format
      await this.testInvalidEmail(result)

    } catch (error) {
      result.errors.push(`Error test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    result.totalDuration = Date.now() - startTime
    return result
  }

  private async testInvalidCommand(result: SMTPTestResult): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand('INVALID_COMMAND')
      
      result.steps.push({
        command: 'INVALID_COMMAND',
        expected: 500,
        actual: response.code,
        success: response.code === 500,
        message: response.message,
        duration: Date.now() - stepStart
      })
    } catch (error) {
      result.steps.push({
        command: 'INVALID_COMMAND',
        expected: 500,
        actual: 0,
        success: false,
        message: `Invalid command test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - stepStart
      })
    }
  }

  private async testBadSequence(result: SMTPTestResult): Promise<void> {
    const stepStart = Date.now()
    
    try {
      // Try DATA without MAIL FROM
      const response = await this.sendCommand('DATA')
      
      result.steps.push({
        command: 'DATA (bad sequence)',
        expected: 503,
        actual: response.code,
        success: response.code === 503,
        message: response.message,
        duration: Date.now() - stepStart
      })
    } catch (error) {
      result.steps.push({
        command: 'DATA (bad sequence)',
        expected: 503,
        actual: 0,
        success: false,
        message: `Bad sequence test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - stepStart
      })
    }
  }

  private async testInvalidEmail(result: SMTPTestResult): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand('MAIL FROM:<invalid-email>')
      
      result.steps.push({
        command: 'MAIL FROM:<invalid-email>',
        expected: 501,
        actual: response.code,
        success: response.code === 501,
        message: response.message,
        duration: Date.now() - stepStart
      })
    } catch (error) {
      result.steps.push({
        command: 'MAIL FROM:<invalid-email>',
        expected: 501,
        actual: 0,
        success: false,
        message: `Invalid email test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - stepStart
      })
    }
  }
}

// Utility function to run SMTP tests
export async function runSMTPTests(baseUrl: string, config: SMTPTestConfig): Promise<SMTPTestResult> {
  const client = new SMTPTestClient(baseUrl)
  return await client.runFullTest(config)
}

// Generate test report
export function generateTestReport(result: SMTPTestResult): string {
  let report = `# SMTP Test Report\n\n`
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
  report += `| Command | Expected | Actual | Status | Duration | Message |\n`
  report += `|---------|----------|--------|--------|----------|----------|\n`

  result.steps.forEach(step => {
    const status = step.success ? '✅' : '❌'
    report += `| ${step.command} | ${step.expected} | ${step.actual} | ${status} | ${step.duration}ms | ${step.message} |\n`
  })

  return report
}
