import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { buildSafeApiRoute } from '@/lib/build-safe-api'
import { ProtocolValidator, generateValidationReport, type ValidationConfig } from '@/lib/protocol-validation'

// POST /api/protocol-test - Run comprehensive protocol validation
export const POST = buildSafeApiRoute(async (request: NextRequest) => {
  // Check admin authentication
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { 
      credentials,
      testEmail,
      protocols = ['SMTP', 'IMAP', 'POP3']
    } = await request.json()

    if (!credentials?.username || !credentials?.password) {
      return NextResponse.json({
        error: 'Missing required credentials',
        required: ['credentials.username', 'credentials.password']
      }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    const config: ValidationConfig = {
      baseUrl,
      credentials,
      testEmail
    }

    const validator = new ProtocolValidator(baseUrl)
    
    // Run validation based on requested protocols
    let results: any = {}
    
    if (protocols.includes('ALL') || protocols.length === 0) {
      results = await validator.validateAllProtocols(config)
    } else {
      // Run individual protocol tests
      const testPromises: Promise<any>[] = []
      
      if (protocols.includes('SMTP')) {
        testPromises.push(validator.validateSMTP(config).then(r => ({ smtp: r })))
      }
      if (protocols.includes('IMAP')) {
        testPromises.push(validator.validateIMAP(config).then(r => ({ imap: r })))
      }
      if (protocols.includes('POP3')) {
        testPromises.push(validator.validatePOP3(config).then(r => ({ pop3: r })))
      }
      
      const protocolResults = await Promise.all(testPromises)
      results = protocolResults.reduce((acc, result) => ({ ...acc, ...result }), {})
      
      // Calculate overall results
      const allTests = Object.values(results).flatMap((r: any) => r.tests)
      const totalTests = allTests.length
      const passedTests = allTests.filter((t: any) => t.success).length
      const failedTests = totalTests - passedTests
      const totalDuration = Object.values(results).reduce((sum: number, r: any) => sum + r.totalDuration, 0)
      
      results.overall = {
        success: failedTests === 0,
        totalTests,
        passedTests,
        failedTests,
        totalDuration
      }
    }

    const report = generateValidationReport(results)

    return NextResponse.json({
      success: results.overall?.success || false,
      results,
      report,
      timestamp: new Date().toISOString(),
      summary: {
        protocols: protocols,
        totalTests: results.overall?.totalTests || 0,
        passedTests: results.overall?.passedTests || 0,
        failedTests: results.overall?.failedTests || 0,
        duration: results.overall?.totalDuration || 0
      }
    })

  } catch (error) {
    console.error('Protocol validation error:', error)
    return NextResponse.json({
      error: 'Protocol validation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
})

// GET /api/protocol-test - Get protocol testing information
export const GET = buildSafeApiRoute(async (request: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    service: 'Protocol Testing & Validation',
    description: 'Comprehensive testing suite for SMTP, IMAP, and POP3 protocol implementations',
    usage: {
      endpoint: '/api/protocol-test',
      method: 'POST',
      authentication: 'Admin role required',
      parameters: {
        required: ['credentials'],
        optional: ['testEmail', 'protocols']
      }
    },
    supportedProtocols: ['SMTP', 'IMAP', 'POP3'],
    testCategories: {
      connection: 'Basic protocol connectivity',
      authentication: 'User authentication and authorization',
      commands: 'Protocol-specific command execution',
      configuration: 'Client configuration endpoints',
      performance: 'Response time and throughput'
    },
    testTypes: {
      individual: 'Test specific protocols separately',
      comprehensive: 'Test all protocols together',
      performance: 'Load and performance testing',
      compatibility: 'Email client compatibility testing'
    },
    examples: {
      allProtocols: {
        credentials: {
          username: 'user@institute.edu',
          password: 'password'
        },
        protocols: ['SMTP', 'IMAP', 'POP3']
      },
      smtpOnly: {
        credentials: {
          username: 'user@institute.edu',
          password: 'password'
        },
        protocols: ['SMTP'],
        testEmail: {
          to: 'test@institute.edu',
          subject: 'Test Email',
          body: 'This is a test email'
        }
      }
    },
    validation: {
      smtp: [
        'Connection establishment',
        'Authentication (PLAIN, LOGIN)',
        'Email sending (MAIL FROM, RCPT TO, DATA)',
        'Configuration endpoints',
        'Error handling'
      ],
      imap: [
        'Connection establishment',
        'Authentication (LOGIN, PLAIN)',
        'Folder operations (LIST, SELECT)',
        'Message operations (FETCH, SEARCH)',
        'Configuration endpoints'
      ],
      pop3: [
        'Connection establishment',
        'Authentication (USER/PASS)',
        'Message operations (STAT, LIST, RETR)',
        'Session management (QUIT)',
        'Configuration endpoints'
      ]
    },
    reporting: {
      formats: ['JSON', 'Markdown'],
      metrics: ['Success rate', 'Response time', 'Error details'],
      export: 'Download test reports'
    }
  })
})

// PUT /api/protocol-test - Run specific test scenarios
export const PUT = buildSafeApiRoute(async (request: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { scenario, credentials, config } = await request.json()

    if (!credentials?.username || !credentials?.password) {
      return NextResponse.json({
        error: 'Credentials required for testing'
      }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const validator = new ProtocolValidator(baseUrl)

    switch (scenario) {
      case 'connectivity':
        return await runConnectivityTests(validator, { baseUrl, credentials })
      
      case 'authentication':
        return await runAuthenticationTests(validator, { baseUrl, credentials })
      
      case 'performance':
        return await runPerformanceTests(validator, { baseUrl, credentials })
      
      case 'compatibility':
        return await runCompatibilityTests(validator, { baseUrl, credentials })
      
      default:
        return NextResponse.json({
          error: 'Invalid scenario',
          availableScenarios: ['connectivity', 'authentication', 'performance', 'compatibility']
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Protocol test scenario error:', error)
    return NextResponse.json({
      error: 'Test scenario failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
})

// Test scenario implementations
async function runConnectivityTests(validator: ProtocolValidator, config: ValidationConfig) {
  const results = await validator.validateAllProtocols(config)
  
  return NextResponse.json({
    scenario: 'connectivity',
    success: results.overall.success,
    results: {
      smtp: results.smtp.tests.filter(t => t.name.includes('Connection')),
      imap: results.imap.tests.filter(t => t.name.includes('Connection')),
      pop3: results.pop3.tests.filter(t => t.name.includes('Connection'))
    },
    summary: {
      totalTests: 3,
      passedTests: [results.smtp, results.imap, results.pop3]
        .filter(r => r.tests.some(t => t.name.includes('Connection') && t.success)).length
    }
  })
}

async function runAuthenticationTests(validator: ProtocolValidator, config: ValidationConfig) {
  const results = await validator.validateAllProtocols(config)
  
  return NextResponse.json({
    scenario: 'authentication',
    success: results.overall.success,
    results: {
      smtp: results.smtp.tests.filter(t => t.name.includes('Authentication')),
      imap: results.imap.tests.filter(t => t.name.includes('Authentication')),
      pop3: results.pop3.tests.filter(t => t.name.includes('Authentication'))
    }
  })
}

async function runPerformanceTests(validator: ProtocolValidator, config: ValidationConfig) {
  const startTime = Date.now()
  
  // Run multiple iterations for performance testing
  const iterations = 3
  const results = []
  
  for (let i = 0; i < iterations; i++) {
    const result = await validator.validateAllProtocols(config)
    results.push(result)
  }
  
  const totalDuration = Date.now() - startTime
  const avgDuration = totalDuration / iterations
  
  return NextResponse.json({
    scenario: 'performance',
    iterations,
    totalDuration,
    averageDuration: avgDuration,
    results: results.map((r, i) => ({
      iteration: i + 1,
      duration: r.overall.totalDuration,
      success: r.overall.success
    }))
  })
}

async function runCompatibilityTests(validator: ProtocolValidator, config: ValidationConfig) {
  // Test configuration endpoints for different clients
  const clients = ['outlook', 'thunderbird', 'apple', 'android', 'ios']
  const results = []
  
  for (const client of clients) {
    try {
      const response = await fetch(`${config.baseUrl}/api/email-config?client=${client}`)
      const configData = await response.json()
      
      results.push({
        client,
        success: response.ok,
        hasConfig: !!configData.clientConfig,
        validation: configData.validation
      })
    } catch (error) {
      results.push({
        client,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
  
  return NextResponse.json({
    scenario: 'compatibility',
    clients: results,
    summary: {
      totalClients: clients.length,
      supportedClients: results.filter(r => r.success).length
    }
  })
}
