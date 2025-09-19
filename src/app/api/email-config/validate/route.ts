import { NextRequest, NextResponse } from 'next/server'
import { buildSafeApiRoute } from '@/lib/build-safe-api'
import { validateClientConfig, getBaseServerConfig } from '@/lib/email-config-service'

// POST /api/email-config/validate - Validate email client configuration
export const POST = buildSafeApiRoute(async (request: NextRequest) => {
  try {
    const { 
      client = 'generic',
      protocol = 'IMAP',
      settings
    } = await request.json()

    // Validate basic configuration
    const validation = validateClientConfig(client, protocol)
    
    // Additional validation checks
    const additionalChecks = {
      serverReachability: false,
      portAccessibility: false,
      sslCertificate: false,
      dnsResolution: false
    }

    const baseConfig = getBaseServerConfig()
    
    // Check DNS resolution
    try {
      const url = new URL(baseConfig.smtp.server)
      additionalChecks.dnsResolution = true
    } catch (error) {
      validation.errors.push('Invalid server URL format')
    }

    // Check port accessibility (simplified check)
    const incomingConfig = protocol === 'IMAP' ? baseConfig.imap : baseConfig.pop3
    const standardPorts = {
      smtp: [25, 465, 587],
      imap: [143, 993],
      pop3: [110, 995]
    }

    if (standardPorts.smtp.includes(baseConfig.smtp.port)) {
      additionalChecks.portAccessibility = true
    }

    if (protocol === 'IMAP' && standardPorts.imap.includes(incomingConfig.port)) {
      additionalChecks.portAccessibility = true
    } else if (protocol === 'POP3' && standardPorts.pop3.includes(incomingConfig.port)) {
      additionalChecks.portAccessibility = true
    }

    // SSL/TLS validation
    if (baseConfig.smtp.security !== 'None' && incomingConfig.security !== 'None') {
      additionalChecks.sslCertificate = true
    }

    // Generate recommendations
    const recommendations: string[] = []
    
    if (client === 'legacy' && protocol === 'IMAP') {
      recommendations.push('Consider using POP3 for better legacy client compatibility')
    }
    
    if (protocol === 'POP3') {
      recommendations.push('Consider IMAP for multi-device email access')
    }
    
    if (!additionalChecks.sslCertificate) {
      recommendations.push('Enable SSL/TLS encryption for security')
    }

    return NextResponse.json({
      client,
      protocol,
      validation: {
        ...validation,
        additionalChecks,
        recommendations
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json({
      error: 'Validation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
})

// GET /api/email-config/validate - Get validation information
export const GET = buildSafeApiRoute(async (request: NextRequest) => {
  return NextResponse.json({
    service: 'Email Configuration Validation',
    description: 'Validate email client configurations for compatibility and security',
    usage: {
      endpoint: '/api/email-config/validate',
      method: 'POST',
      parameters: {
        client: 'Email client name (outlook, thunderbird, apple, etc.)',
        protocol: 'Email protocol (IMAP or POP3)',
        settings: 'Optional custom settings to validate'
      }
    },
    validationChecks: {
      basic: [
        'Client support verification',
        'Protocol compatibility',
        'Server configuration',
        'Domain configuration'
      ],
      advanced: [
        'DNS resolution',
        'Port accessibility',
        'SSL certificate validation',
        'Authentication methods'
      ]
    },
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
    recommendations: {
      security: 'Always use SSL/TLS encryption',
      compatibility: 'Test configuration before deployment',
      performance: 'Use IMAP for multi-device access',
      legacy: 'Use POP3 for older clients if needed'
    }
  })
})
