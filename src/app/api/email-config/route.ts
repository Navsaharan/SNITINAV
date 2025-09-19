import { NextRequest, NextResponse } from 'next/server'
import { buildSafeApiRoute } from '@/lib/build-safe-api'
import {
  getBaseServerConfig,
  generateClientConfig,
  generateAutoDiscoverXML,
  generateThunderbirdAutoConfigXML,
  generateAppleConfigProfile,
  validateClientConfig,
  testClientConfiguration
} from '@/lib/email-config-service'

// GET /api/email-config - Unified email client configuration
export const GET = buildSafeApiRoute(async (request: NextRequest) => {
  const url = new URL(request.url)
  const client = url.searchParams.get('client') || 'generic'
  const protocol = (url.searchParams.get('protocol') || 'IMAP').toUpperCase() as 'IMAP' | 'POP3'
  const format = url.searchParams.get('format') || 'json'
  const domain = url.searchParams.get('domain')

  try {
    // Handle format-specific requests
    switch (format.toLowerCase()) {
      case 'autodiscover':
      case 'xml':
        return new NextResponse(generateAutoDiscoverXML(protocol), {
          headers: { 
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600'
          }
        })
      
      case 'thunderbird':
        return new NextResponse(generateThunderbirdAutoConfigXML(protocol), {
          headers: { 
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600'
          }
        })
      
      case 'apple':
      case 'mobileconfig':
        return new NextResponse(generateAppleConfigProfile(protocol), {
          headers: { 
            'Content-Type': 'application/x-apple-aspen-config',
            'Content-Disposition': 'attachment; filename="email-config.mobileconfig"',
            'Cache-Control': 'public, max-age=3600'
          }
        })
      
      case 'json':
      default:
        // Return JSON configuration
        const baseConfig = getBaseServerConfig()
        const clientConfig = generateClientConfig(client, protocol)
        const validation = validateClientConfig(client, protocol)

        return NextResponse.json({
          service: 'Unified Email Configuration',
          timestamp: new Date().toISOString(),
          baseConfig,
          clientConfig,
          validation,
          supportedClients: [
            'outlook',
            'thunderbird', 
            'apple',
            'android',
            'ios',
            'legacy',
            'generic'
          ],
          supportedProtocols: ['IMAP', 'POP3'],
          supportedFormats: ['json', 'xml', 'autodiscover', 'thunderbird', 'apple'],
          endpoints: {
            unified: '/api/email-config',
            smtp: '/api/smtp/config',
            imap: '/api/imap/config',
            pop3: '/api/pop3/config',
            test: '/api/email-config/test',
            validate: '/api/email-config/validate'
          }
        }, {
          headers: {
            'Cache-Control': 'public, max-age=300' // 5 minutes cache
          }
        })
    }

  } catch (error) {
    console.error('Email config error:', error)
    return NextResponse.json({
      error: 'Failed to generate configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
})

// POST /api/email-config - Test configuration
export const POST = buildSafeApiRoute(async (request: NextRequest) => {
  try {
    const { 
      client = 'generic',
      protocol = 'IMAP',
      credentials,
      validate = true
    } = await request.json()

    const results: any = {
      client,
      protocol,
      timestamp: new Date().toISOString()
    }

    // Validate configuration
    if (validate) {
      results.validation = validateClientConfig(client, protocol)
    }

    // Test configuration if credentials provided
    if (credentials?.username && credentials?.password) {
      results.test = await testClientConfiguration(client, protocol, credentials)
    }

    // Generate configuration
    results.config = generateClientConfig(client, protocol)

    return NextResponse.json({
      success: true,
      results
    })

  } catch (error) {
    console.error('Email config test error:', error)
    return NextResponse.json({
      error: 'Configuration test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
})
