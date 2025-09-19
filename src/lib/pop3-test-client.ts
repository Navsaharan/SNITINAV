// POP3 Test Client for validating protocol implementation

export interface POP3TestResult {
  success: boolean
  steps: Array<{
    command: string
    expected: string
    actual: string
    success: boolean
    response: any
    duration: number
  }>
  totalDuration: number
  errors: string[]
}

export interface POP3TestConfig {
  baseUrl: string
  username: string
  password: string
}

export class POP3TestClient {
  private baseUrl: string
  private sessionId?: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '') // Remove trailing slash
  }

  // Run comprehensive POP3 test
  async runFullTest(config: POP3TestConfig): Promise<POP3TestResult> {
    const startTime = Date.now()
    const result: POP3TestResult = {
      success: true,
      steps: [],
      totalDuration: 0,
      errors: []
    }

    try {
      // Test sequence
      await this.testConnect(result)
      await this.testCapabilities(result)
      await this.testUser(result, config.username)
      await this.testPass(result, config.password)
      await this.testStat(result)
      await this.testList(result)
      await this.testUidl(result)
      await this.testRetr(result, '1')
      await this.testTop(result, '1', '5')
      await this.testDele(result, '1')
      await this.testRset(result)
      await this.testNoop(result)
      await this.testQuit(result)

    } catch (error) {
      result.success = false
      result.errors.push(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    result.totalDuration = Date.now() - startTime
    result.success = result.success && result.steps.every(step => step.success)

    return result
  }

  // Test individual POP3 commands
  async testConnect(result: POP3TestResult): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await fetch(`${this.baseUrl}/api/pop3`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      const data = await response.json()
      this.sessionId = data.sessionId

      result.steps.push({
        command: 'CONNECT',
        expected: '+OK',
        actual: data.response?.status || 'ERROR',
        success: data.response?.status === '+OK',
        response: data.response,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: 'CONNECT',
        expected: '+OK',
        actual: 'ERROR',
        success: false,
        response: null,
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  async testCapabilities(result: POP3TestResult): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand('CAPA')
      
      result.steps.push({
        command: 'CAPA',
        expected: '+OK',
        actual: response.status,
        success: response.status === '+OK',
        response,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: 'CAPA',
        expected: '+OK',
        actual: 'ERROR',
        success: false,
        response: null,
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  async testUser(result: POP3TestResult, username: string): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand(`USER ${username}`)
      
      result.steps.push({
        command: `USER ${username}`,
        expected: '+OK',
        actual: response.status,
        success: response.status === '+OK',
        response,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: `USER ${username}`,
        expected: '+OK',
        actual: 'ERROR',
        success: false,
        response: null,
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  async testPass(result: POP3TestResult, password: string): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand(`PASS ${password}`)
      
      result.steps.push({
        command: `PASS ****`,
        expected: '+OK',
        actual: response.status,
        success: response.status === '+OK',
        response,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: `PASS ****`,
        expected: '+OK',
        actual: 'ERROR',
        success: false,
        response: null,
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  async testStat(result: POP3TestResult): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand('STAT')
      
      result.steps.push({
        command: 'STAT',
        expected: '+OK',
        actual: response.status,
        success: response.status === '+OK',
        response,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: 'STAT',
        expected: '+OK',
        actual: 'ERROR',
        success: false,
        response: null,
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  async testList(result: POP3TestResult): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand('LIST')
      
      result.steps.push({
        command: 'LIST',
        expected: '+OK',
        actual: response.status,
        success: response.status === '+OK',
        response,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: 'LIST',
        expected: '+OK',
        actual: 'ERROR',
        success: false,
        response: null,
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  async testUidl(result: POP3TestResult): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand('UIDL')
      
      result.steps.push({
        command: 'UIDL',
        expected: '+OK',
        actual: response.status,
        success: response.status === '+OK',
        response,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: 'UIDL',
        expected: '+OK',
        actual: 'ERROR',
        success: false,
        response: null,
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  async testRetr(result: POP3TestResult, messageNumber: string): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand(`RETR ${messageNumber}`)
      
      // RETR might fail if no messages exist, which is acceptable
      const success = response.status === '+OK' || response.message?.includes('No such message')
      
      result.steps.push({
        command: `RETR ${messageNumber}`,
        expected: '+OK or No such message',
        actual: response.status,
        success,
        response,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: `RETR ${messageNumber}`,
        expected: '+OK or No such message',
        actual: 'ERROR',
        success: false,
        response: null,
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  async testTop(result: POP3TestResult, messageNumber: string, lines: string): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand(`TOP ${messageNumber} ${lines}`)
      
      // TOP might fail if no messages exist, which is acceptable
      const success = response.status === '+OK' || response.message?.includes('No such message')
      
      result.steps.push({
        command: `TOP ${messageNumber} ${lines}`,
        expected: '+OK or No such message',
        actual: response.status,
        success,
        response,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: `TOP ${messageNumber} ${lines}`,
        expected: '+OK or No such message',
        actual: 'ERROR',
        success: false,
        response: null,
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  async testDele(result: POP3TestResult, messageNumber: string): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand(`DELE ${messageNumber}`)
      
      // DELE might fail if no messages exist, which is acceptable
      const success = response.status === '+OK' || response.message?.includes('No such message')
      
      result.steps.push({
        command: `DELE ${messageNumber}`,
        expected: '+OK or No such message',
        actual: response.status,
        success,
        response,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: `DELE ${messageNumber}`,
        expected: '+OK or No such message',
        actual: 'ERROR',
        success: false,
        response: null,
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  async testRset(result: POP3TestResult): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand('RSET')
      
      result.steps.push({
        command: 'RSET',
        expected: '+OK',
        actual: response.status,
        success: response.status === '+OK',
        response,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: 'RSET',
        expected: '+OK',
        actual: 'ERROR',
        success: false,
        response: null,
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  async testNoop(result: POP3TestResult): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand('NOOP')
      
      result.steps.push({
        command: 'NOOP',
        expected: '+OK',
        actual: response.status,
        success: response.status === '+OK',
        response,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: 'NOOP',
        expected: '+OK',
        actual: 'ERROR',
        success: false,
        response: null,
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  async testQuit(result: POP3TestResult): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand('QUIT')
      
      result.steps.push({
        command: 'QUIT',
        expected: '+OK',
        actual: response.status,
        success: response.status === '+OK',
        response,
        duration: Date.now() - stepStart
      })

    } catch (error) {
      result.steps.push({
        command: 'QUIT',
        expected: '+OK',
        actual: 'ERROR',
        success: false,
        response: null,
        duration: Date.now() - stepStart
      })
      throw error
    }
  }

  // Send POP3 command
  private async sendCommand(command: string): Promise<{ status: string; message: string; data?: string[] }> {
    const response = await fetch(`${this.baseUrl}/api/pop3`, {
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
    return data.response || { status: '-ERR', message: 'No response' }
  }

  // Test error conditions
  async testErrorConditions(): Promise<POP3TestResult> {
    const result: POP3TestResult = {
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

  private async testInvalidCommand(result: POP3TestResult): Promise<void> {
    const stepStart = Date.now()
    
    try {
      const response = await this.sendCommand('INVALID_COMMAND')
      
      result.steps.push({
        command: 'INVALID_COMMAND',
        expected: '-ERR',
        actual: response.status,
        success: response.status === '-ERR',
        response,
        duration: Date.now() - stepStart
      })
    } catch (error) {
      result.steps.push({
        command: 'INVALID_COMMAND',
        expected: '-ERR',
        actual: 'ERROR',
        success: false,
        response: null,
        duration: Date.now() - stepStart
      })
    }
  }

  private async testBadSequence(result: POP3TestResult): Promise<void> {
    const stepStart = Date.now()
    
    try {
      // Try STAT without authentication
      const response = await this.sendCommand('STAT')
      
      result.steps.push({
        command: 'STAT (without auth)',
        expected: '-ERR',
        actual: response.status,
        success: response.status === '-ERR',
        response,
        duration: Date.now() - stepStart
      })
    } catch (error) {
      result.steps.push({
        command: 'STAT (without auth)',
        expected: '-ERR',
        actual: 'ERROR',
        success: false,
        response: null,
        duration: Date.now() - stepStart
      })
    }
  }

  private async testAuthFailure(result: POP3TestResult): Promise<void> {
    const stepStart = Date.now()
    
    try {
      await this.sendCommand('USER invalid@example.com')
      const response = await this.sendCommand('PASS wrongpassword')
      
      result.steps.push({
        command: 'PASS (invalid credentials)',
        expected: '-ERR',
        actual: response.status,
        success: response.status === '-ERR',
        response,
        duration: Date.now() - stepStart
      })
    } catch (error) {
      result.steps.push({
        command: 'PASS (invalid credentials)',
        expected: '-ERR',
        actual: 'ERROR',
        success: false,
        response: null,
        duration: Date.now() - stepStart
      })
    }
  }
}

// Utility function to run POP3 tests
export async function runPOP3Tests(baseUrl: string, config: POP3TestConfig): Promise<POP3TestResult> {
  const client = new POP3TestClient(baseUrl)
  return await client.runFullTest(config)
}

// Generate test report
export function generatePOP3TestReport(result: POP3TestResult): string {
  let report = `# POP3 Test Report\n\n`
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
    const message = step.response?.message || 'No message'
    report += `| ${step.command} | ${step.expected} | ${step.actual} | ${status} | ${step.duration}ms | ${message} |\n`
  })

  return report
}
