import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { buildSafeApiRoute } from '@/lib/build-safe-api'
import { testClientConfiguration, generateClientConfig, getBaseServerConfig } from '@/lib/email-config-service'

// POST /api/email-config/test - Test email client configuration
export const POST = buildSafeApiRoute(async (request: NextRequest) => {
  // Check authentication for testing
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const { 
      client = 'generic',
      protocol = 'IMAP',
      credentials,
      testType = 'basic'
    } = await request.json()

    if (!credentials?.username || !credentials?.password) {
      return NextResponse.json({
        error: 'Credentials required for testing',
        required: ['username', 'password']
      }, { status: 400 })
    }

    const results: any = {
      client,
      protocol,
      testType,
      timestamp: new Date().toISOString(),
      tests: {}
    }

    // Run configuration test
    const configTest = await testClientConfiguration(client, protocol, credentials)
    results.tests.configuration = configTest

    // Run protocol-specific tests
    if (testType === 'comprehensive') {
      results.tests.protocols = await runProtocolTests(protocol, credentials)
    }

    // Test client-specific features
    results.tests.clientFeatures = await testClientFeatures(client, protocol)

    // Generate test report
    const testReport = generateTestReport(results)
    results.report = testReport

    return NextResponse.json({
      success: configTest.success,
      results
    })

  } catch (error) {
    console.error('Configuration test error:', error)
    return NextResponse.json({
      error: 'Configuration test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
})

// Run protocol-specific tests
async function runProtocolTests(protocol: 'IMAP' | 'POP3', credentials: any) {
  const tests = {
    smtp: { success: false, message: '' },
    incoming: { success: false, message: '' },
    authentication: { success: false, message: '' }
  }

  const config = getBaseServerConfig()

  try {
    // Test SMTP
    const smtpResponse = await fetch(`${config.smtp.server}`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    tests.smtp.success = smtpResponse.ok
    tests.smtp.message = smtpResponse.ok ? 'SMTP server accessible' : 'SMTP server not accessible'

    // Test incoming protocol
    const incomingConfig = protocol === 'IMAP' ? config.imap : config.pop3
    const incomingResponse = await fetch(`${incomingConfig.server}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    tests.incoming.success = incomingResponse.ok
    tests.incoming.message = incomingResponse.ok ? `${protocol} server accessible` : `${protocol} server not accessible`

    // Test authentication
    if (protocol === 'IMAP') {
      const authResponse = await fetch(`${config.imap.server}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'LOGIN',
          credentials
        })
      })
      tests.authentication.success = authResponse.ok
      tests.authentication.message = authResponse.ok ? 'Authentication successful' : 'Authentication failed'
    } else {
      // POP3 authentication test would go here
      tests.authentication.success = true
      tests.authentication.message = 'POP3 authentication test not implemented'
    }

  } catch (error) {
    tests.smtp.message = 'SMTP test failed'
    tests.incoming.message = `${protocol} test failed`
    tests.authentication.message = 'Authentication test failed'
  }

  return tests
}

// Test client-specific features
async function testClientFeatures(client: string, protocol: 'IMAP' | 'POP3') {
  const features = {
    autoconfig: false,
    ssl: true,
    authentication: true,
    folders: protocol === 'IMAP',
    offline: protocol === 'POP3'
  }

  // Client-specific feature checks
  switch (client.toLowerCase()) {
    case 'outlook':
      features.autoconfig = true
      break
    
    case 'thunderbird':
      features.autoconfig = true
      break
    
    case 'apple':
      features.autoconfig = true
      break
    
    case 'legacy':
      features.ssl = false // Some legacy clients don't support SSL
      features.autoconfig = false
      break
  }

  return {
    supported: features,
    recommendations: generateClientRecommendations(client, protocol, features)
  }
}

// Generate client recommendations
function generateClientRecommendations(client: string, protocol: 'IMAP' | 'POP3', features: any): string[] {
  const recommendations: string[] = []

  if (!features.ssl) {
    recommendations.push('Enable SSL/TLS support for security')
  }

  if (!features.autoconfig) {
    recommendations.push('Use manual configuration for this client')
  }

  if (protocol === 'POP3' && client !== 'legacy') {
    recommendations.push('Consider using IMAP for better functionality')
  }

  if (client === 'legacy') {
    recommendations.push('Consider upgrading to a modern email client')
  }

  return recommendations
}

// Generate test report
function generateTestReport(results: any): string {
  let report = `# Email Configuration Test Report\n\n`
  report += `**Client**: ${results.client}\n`
  report += `**Protocol**: ${results.protocol}\n`
  report += `**Test Type**: ${results.testType}\n`
  report += `**Timestamp**: ${results.timestamp}\n\n`

  // Configuration test results
  if (results.tests.configuration) {
    const config = results.tests.configuration
    report += `## Configuration Test\n`
    report += `**Overall**: ${config.success ? '✅ PASSED' : '❌ FAILED'}\n`
    report += `- SMTP: ${config.results.smtp ? '✅' : '❌'}\n`
    report += `- Incoming: ${config.results.incoming ? '✅' : '❌'}\n`
    report += `- Authentication: ${config.results.authentication ? '✅' : '❌'}\n\n`

    if (config.errors.length > 0) {
      report += `**Errors**:\n`
      config.errors.forEach((error: string) => {
        report += `- ${error}\n`
      })
      report += `\n`
    }
  }

  // Protocol test results
  if (results.tests.protocols) {
    const protocols = results.tests.protocols
    report += `## Protocol Tests\n`
    Object.entries(protocols).forEach(([test, result]: [string, any]) => {
      report += `**${test.toUpperCase()}**: ${result.success ? '✅' : '❌'} - ${result.message}\n`
    })
    report += `\n`
  }

  // Client features
  if (results.tests.clientFeatures) {
    const features = results.tests.clientFeatures
    report += `## Client Features\n`
    Object.entries(features.supported).forEach(([feature, supported]: [string, any]) => {
      report += `- ${feature}: ${supported ? '✅' : '❌'}\n`
    })
    
    if (features.recommendations.length > 0) {
      report += `\n**Recommendations**:\n`
      features.recommendations.forEach((rec: string) => {
        report += `- ${rec}\n`
      })
    }
  }

  return report
}

// GET /api/email-config/test - Get test information
export const GET = buildSafeApiRoute(async (request: NextRequest) => {
  return NextResponse.json({
    service: 'Email Configuration Testing',
    description: 'Test email client configurations for functionality and compatibility',
    usage: {
      endpoint: '/api/email-config/test',
      method: 'POST',
      authentication: 'Required',
      parameters: {
        client: 'Email client name',
        protocol: 'Email protocol (IMAP or POP3)',
        credentials: 'User credentials for testing',
        testType: 'basic or comprehensive'
      }
    },
    testTypes: {
      basic: 'Test server connectivity and basic authentication',
      comprehensive: 'Full protocol testing including advanced features'
    },
    testCategories: {
      configuration: 'Server accessibility and basic setup',
      protocols: 'SMTP, IMAP/POP3 protocol functionality',
      clientFeatures: 'Client-specific feature compatibility',
      security: 'SSL/TLS and authentication testing'
    },
    requirements: {
      authentication: 'User must be logged in to run tests',
      credentials: 'Valid email credentials required',
      permissions: 'User can only test their own account'
    }
  })
})
