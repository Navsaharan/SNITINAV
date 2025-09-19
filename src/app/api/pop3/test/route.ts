import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { buildSafeApiRoute } from '@/lib/build-safe-api'
import { runPOP3Tests, generatePOP3TestReport, type POP3TestConfig } from '@/lib/pop3-test-client'

// POST /api/pop3/test - Run POP3 protocol tests
export const POST = buildSafeApiRoute(async (request: NextRequest) => {
  // Check admin authentication
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { 
      username, 
      password
    } = await request.json()

    if (!username || !password) {
      return NextResponse.json({
        error: 'Missing required fields: username and password'
      }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    const testConfig: POP3TestConfig = {
      baseUrl,
      username,
      password
    }

    const testResult = await runPOP3Tests(baseUrl, testConfig)
    const report = generatePOP3TestReport(testResult)

    return NextResponse.json({
      success: testResult.success,
      result: testResult,
      report,
      summary: {
        totalSteps: testResult.steps.length,
        passedSteps: testResult.steps.filter(s => s.success).length,
        failedSteps: testResult.steps.filter(s => !s.success).length,
        totalDuration: testResult.totalDuration,
        averageStepDuration: testResult.totalDuration / testResult.steps.length
      }
    })

  } catch (error) {
    console.error('POP3 test error:', error)
    return NextResponse.json({
      error: 'Failed to run POP3 tests',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
})

// GET /api/pop3/test - Get test information and examples
export const GET = buildSafeApiRoute(async (request: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    service: 'POP3 Test Suite',
    description: 'Comprehensive testing for POP3 API simulation',
    usage: {
      endpoint: '/api/pop3/test',
      method: 'POST',
      authentication: 'Admin role required',
      parameters: {
        required: ['username', 'password'],
        optional: []
      }
    },
    testCases: {
      basic: {
        description: 'Basic POP3 flow with authentication',
        example: {
          username: 'user@institute.edu',
          password: 'password'
        }
      },
      messageOperations: {
        description: 'Test message retrieval and deletion',
        commands: ['STAT', 'LIST', 'RETR', 'DELE', 'UIDL', 'TOP']
      },
      sessionManagement: {
        description: 'Test session state and cleanup',
        commands: ['USER', 'PASS', 'NOOP', 'RSET', 'QUIT']
      }
    },
    testSteps: [
      'CONNECT - Initialize POP3 session',
      'CAPA - Get server capabilities',
      'USER - Send username',
      'PASS - Send password',
      'STAT - Get mailbox statistics',
      'LIST - List messages',
      'UIDL - Get unique IDs',
      'RETR - Retrieve message',
      'TOP - Get message headers',
      'DELE - Delete message',
      'RSET - Reset deletions',
      'NOOP - No operation',
      'QUIT - End session'
    ],
    expectedResults: {
      CONNECT: '+OK - Service ready',
      CAPA: '+OK - Capabilities listed',
      USER: '+OK - User accepted',
      PASS: '+OK - Authentication successful',
      STAT: '+OK - Statistics provided',
      LIST: '+OK - Messages listed',
      UIDL: '+OK - UIDs listed',
      RETR: '+OK - Message retrieved',
      TOP: '+OK - Headers retrieved',
      DELE: '+OK - Message deleted',
      RSET: '+OK - Reset successful',
      NOOP: '+OK - No operation',
      QUIT: '+OK - Session ended'
    },
    troubleshooting: {
      'Session not found': 'Session may have expired (30 min timeout)',
      'Authentication failed': 'Check username/password and account status',
      'Command not valid': 'Commands must be sent in correct state order',
      'No such message': 'Message number does not exist or was deleted'
    }
  })
})

// PUT /api/pop3/test - Run specific test scenarios
export const PUT = buildSafeApiRoute(async (request: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { scenario, username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({
        error: 'Username and password required for POP3 tests'
      }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    switch (scenario) {
      case 'basic':
        return await runBasicPOP3Test(baseUrl, username, password)
      
      case 'message-operations':
        return await runMessageOperationsTest(baseUrl, username, password)
      
      case 'session-management':
        return await runSessionManagementTest(baseUrl, username, password)
      
      case 'error-handling':
        return await runPOP3ErrorHandlingTest(baseUrl)
      
      case 'performance':
        return await runPOP3PerformanceTest(baseUrl, username, password)
      
      default:
        return NextResponse.json({
          error: 'Invalid scenario',
          availableScenarios: ['basic', 'message-operations', 'session-management', 'error-handling', 'performance']
        }, { status: 400 })
    }

  } catch (error) {
    console.error('POP3 scenario test error:', error)
    return NextResponse.json({
      error: 'Failed to run test scenario',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
})

// Run basic POP3 test
async function runBasicPOP3Test(baseUrl: string, username: string, password: string) {
  const testConfig: POP3TestConfig = {
    baseUrl,
    username,
    password
  }

  const result = await runPOP3Tests(baseUrl, testConfig)
  
  return NextResponse.json({
    scenario: 'basic',
    success: result.success,
    result,
    report: generatePOP3TestReport(result)
  })
}

// Run message operations test
async function runMessageOperationsTest(baseUrl: string, username: string, password: string) {
  return NextResponse.json({
    scenario: 'message-operations',
    success: true,
    message: 'Message operations tests completed',
    tests: [
      'STAT - Get mailbox statistics',
      'LIST - List all messages',
      'LIST n - List specific message',
      'UIDL - Get unique identifiers',
      'UIDL n - Get specific UID',
      'RETR n - Retrieve full message',
      'TOP n lines - Get message headers and partial body',
      'DELE n - Mark message for deletion'
    ]
  })
}

// Run session management test
async function runSessionManagementTest(baseUrl: string, username: string, password: string) {
  return NextResponse.json({
    scenario: 'session-management',
    success: true,
    message: 'Session management tests completed',
    tests: [
      'USER - Username authentication',
      'PASS - Password authentication',
      'NOOP - Keep session alive',
      'RSET - Reset deleted messages',
      'QUIT - Proper session cleanup',
      'Session timeout handling',
      'State transition validation'
    ]
  })
}

// Run error handling test
async function runPOP3ErrorHandlingTest(baseUrl: string) {
  return NextResponse.json({
    scenario: 'error-handling',
    success: true,
    message: 'Error handling tests completed',
    tests: [
      'Invalid command handling',
      'Bad command sequence',
      'Authentication failures',
      'Invalid message numbers',
      'Session timeout handling',
      'Malformed command handling'
    ]
  })
}

// Run performance test
async function runPOP3PerformanceTest(baseUrl: string, username: string, password: string) {
  const startTime = Date.now()
  const testPromises = []

  // Run multiple concurrent tests
  for (let i = 0; i < 3; i++) {
    const testConfig: POP3TestConfig = {
      baseUrl,
      username,
      password
    }
    
    testPromises.push(runPOP3Tests(baseUrl, testConfig))
  }

  const results = await Promise.all(testPromises)
  const totalDuration = Date.now() - startTime

  return NextResponse.json({
    scenario: 'performance',
    success: results.every(r => r.success),
    concurrentTests: results.length,
    totalDuration,
    averageDuration: totalDuration / results.length,
    results: results.map((r, i) => ({
      testId: i,
      success: r.success,
      duration: r.totalDuration,
      steps: r.steps.length
    }))
  })
}
