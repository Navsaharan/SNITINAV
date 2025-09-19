import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { buildSafeApiRoute } from '@/lib/build-safe-api'
import {
  SpamDetector,
  VirusScanner,
  PhishingDetector,
  ComplianceChecker,
  EmailEncryption,
  type SecurityScanResult,
  type ComplianceCheck,
  type EncryptionOptions
} from '@/lib/email-security'

// POST /api/email-security - Comprehensive email security scanning
export const POST = buildSafeApiRoute(async (request: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const {
      email,
      scanTypes = ['spam', 'virus', 'phishing', 'compliance'],
      compliancePolicies = ['GDPR', 'FERPA'],
      encryptionOptions
    } = await request.json()

    if (!email) {
      return NextResponse.json({
        error: 'Email content required',
        required: ['email']
      }, { status: 400 })
    }

    const results: any = {
      timestamp: new Date().toISOString(),
      email: {
        subject: email.subject,
        fromEmail: email.fromEmail,
        recipientCount: email.recipients?.length || 0
      },
      security: {},
      recommendations: []
    }

    // Spam Detection
    if (scanTypes.includes('spam')) {
      const spamDetector = new SpamDetector()
      const spamResult = await spamDetector.scanForSpam({
        subject: email.subject,
        body: email.body,
        fromEmail: email.fromEmail,
        fromName: email.fromName
      })
      
      results.security.spam = spamResult
      if (!spamResult.safe) {
        results.recommendations.push(...spamResult.recommendations)
      }
    }

    // Virus Scanning
    if (scanTypes.includes('virus') && email.attachments) {
      const virusScanner = new VirusScanner()
      const virusResult = await virusScanner.scanAttachments(email.attachments)
      
      results.security.virus = virusResult
      if (!virusResult.safe) {
        results.recommendations.push(...virusResult.recommendations)
      }
    }

    // Phishing Detection
    if (scanTypes.includes('phishing')) {
      const phishingDetector = new PhishingDetector()
      const phishingResult = await phishingDetector.detectPhishing({
        subject: email.subject,
        body: email.body,
        fromEmail: email.fromEmail,
        links: email.links
      })
      
      results.security.phishing = phishingResult
      if (!phishingResult.safe) {
        results.recommendations.push(...phishingResult.recommendations)
      }
    }

    // Compliance Checking
    if (scanTypes.includes('compliance')) {
      const complianceChecker = new ComplianceChecker()
      const complianceResult = await complianceChecker.checkCompliance({
        subject: email.subject,
        body: email.body,
        attachments: email.attachments,
        recipients: email.recipients || []
      }, compliancePolicies)
      
      results.security.compliance = complianceResult
      if (!complianceResult.compliant) {
        results.recommendations.push(
          ...complianceResult.violations.map(v => v.suggestion)
        )
      }
    }

    // Email Encryption
    if (encryptionOptions?.enabled) {
      const emailEncryption = new EmailEncryption()
      const encryptionResult = await emailEncryption.encryptEmail({
        subject: email.subject,
        body: email.body,
        attachments: email.attachments
      }, encryptionOptions)
      
      results.security.encryption = encryptionResult
    }

    // Overall security assessment
    const securityScores = Object.values(results.security)
      .filter((result: any) => result.score !== undefined)
      .map((result: any) => result.score)

    const averageScore = securityScores.length > 0 
      ? securityScores.reduce((sum: number, score: number) => sum + score, 0) / securityScores.length
      : 0

    results.overall = {
      safe: averageScore < 0.5,
      riskLevel: averageScore < 0.3 ? 'low' : averageScore < 0.7 ? 'medium' : 'high',
      score: averageScore,
      scanTypes: scanTypes,
      recommendationCount: results.recommendations.length
    }

    return NextResponse.json({
      success: true,
      results
    })

  } catch (error) {
    console.error('Email security scan error:', error)
    return NextResponse.json({
      error: 'Security scan failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
})

// GET /api/email-security - Get security service information
export const GET = buildSafeApiRoute(async (request: NextRequest) => {
  return NextResponse.json({
    service: 'Email Security & Compliance',
    description: 'Comprehensive email security scanning and compliance checking',
    features: {
      spamDetection: {
        description: 'Advanced spam detection using keyword analysis and pattern recognition',
        capabilities: [
          'Keyword-based filtering',
          'Suspicious pattern detection',
          'Sender reputation analysis',
          'Content analysis scoring'
        ]
      },
      virusScanning: {
        description: 'Malware and virus detection for email attachments',
        capabilities: [
          'File extension analysis',
          'Content signature scanning',
          'Malware pattern detection',
          'Suspicious file identification'
        ]
      },
      phishingDetection: {
        description: 'Phishing attempt identification and prevention',
        capabilities: [
          'Phishing keyword detection',
          'Domain spoofing analysis',
          'Suspicious link detection',
          'Social engineering pattern recognition'
        ]
      },
      complianceChecking: {
        description: 'Regulatory compliance validation',
        supportedPolicies: ['GDPR', 'HIPAA', 'SOX', 'FERPA'],
        capabilities: [
          'Personal data detection',
          'Consent requirement validation',
          'Data protection compliance',
          'Regulatory violation identification'
        ]
      },
      encryption: {
        description: 'Email encryption and decryption services',
        supportedMethods: ['TLS', 'PGP', 'S/MIME'],
        capabilities: [
          'Transport layer encryption',
          'End-to-end encryption',
          'Digital signatures',
          'Key management'
        ]
      }
    },
    usage: {
      endpoint: '/api/email-security',
      method: 'POST',
      authentication: 'Required',
      parameters: {
        required: ['email'],
        optional: ['scanTypes', 'compliancePolicies', 'encryptionOptions']
      }
    },
    scanTypes: {
      spam: 'Spam and unwanted email detection',
      virus: 'Virus and malware scanning',
      phishing: 'Phishing attempt detection',
      compliance: 'Regulatory compliance checking'
    },
    compliancePolicies: {
      GDPR: 'General Data Protection Regulation',
      HIPAA: 'Health Insurance Portability and Accountability Act',
      SOX: 'Sarbanes-Oxley Act',
      FERPA: 'Family Educational Rights and Privacy Act'
    },
    encryptionMethods: {
      TLS: 'Transport Layer Security',
      PGP: 'Pretty Good Privacy',
      'S/MIME': 'Secure/Multipurpose Internet Mail Extensions'
    },
    riskLevels: {
      low: 'Score < 0.3 - Minimal security concerns',
      medium: 'Score 0.3-0.7 - Moderate security concerns',
      high: 'Score > 0.7 - High security risk'
    },
    examples: {
      basicScan: {
        email: {
          subject: 'Important Message',
          body: 'Email content here',
          fromEmail: 'sender@example.com',
          recipients: [{ email: 'user@institute.edu', type: 'TO' }]
        },
        scanTypes: ['spam', 'phishing']
      },
      comprehensiveScan: {
        email: {
          subject: 'Document with Attachments',
          body: 'Please review the attached documents',
          fromEmail: 'colleague@institute.edu',
          attachments: [
            { filename: 'document.pdf', size: 1024000, mimeType: 'application/pdf' }
          ],
          recipients: [{ email: 'user@institute.edu', type: 'TO' }]
        },
        scanTypes: ['spam', 'virus', 'phishing', 'compliance'],
        compliancePolicies: ['GDPR', 'FERPA']
      },
      encryptedEmail: {
        email: {
          subject: 'Confidential Information',
          body: 'Sensitive content requiring encryption'
        },
        encryptionOptions: {
          enabled: true,
          method: 'PGP',
          keyId: 'user-key-id'
        }
      }
    }
  })
})

// PUT /api/email-security - Update security policies and settings
export const PUT = buildSafeApiRoute(async (request: NextRequest) => {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const { action, settings } = await request.json()

    switch (action) {
      case 'updateSpamFilter':
        return await updateSpamFilterSettings(settings)
      
      case 'updateCompliancePolicies':
        return await updateCompliancePolicies(settings)
      
      case 'updateEncryptionSettings':
        return await updateEncryptionSettings(settings)
      
      case 'updateSecurityPolicies':
        return await updateSecurityPolicies(settings)
      
      default:
        return NextResponse.json({
          error: 'Invalid action',
          availableActions: [
            'updateSpamFilter',
            'updateCompliancePolicies', 
            'updateEncryptionSettings',
            'updateSecurityPolicies'
          ]
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Security settings update error:', error)
    return NextResponse.json({
      error: 'Failed to update security settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
})

// Helper functions for security settings management
async function updateSpamFilterSettings(settings: any) {
  // In production, this would update database settings
  return NextResponse.json({
    success: true,
    message: 'Spam filter settings updated',
    settings: {
      sensitivity: settings.sensitivity || 'medium',
      customKeywords: settings.customKeywords || [],
      whitelist: settings.whitelist || [],
      blacklist: settings.blacklist || []
    }
  })
}

async function updateCompliancePolicies(settings: any) {
  return NextResponse.json({
    success: true,
    message: 'Compliance policies updated',
    settings: {
      enabledPolicies: settings.enabledPolicies || ['GDPR', 'FERPA'],
      strictMode: settings.strictMode || false,
      autoBlock: settings.autoBlock || false
    }
  })
}

async function updateEncryptionSettings(settings: any) {
  return NextResponse.json({
    success: true,
    message: 'Encryption settings updated',
    settings: {
      defaultMethod: settings.defaultMethod || 'TLS',
      enforceEncryption: settings.enforceEncryption || false,
      keyRotationInterval: settings.keyRotationInterval || 90
    }
  })
}

async function updateSecurityPolicies(settings: any) {
  return NextResponse.json({
    success: true,
    message: 'Security policies updated',
    settings: {
      autoQuarantine: settings.autoQuarantine || true,
      notifyAdmins: settings.notifyAdmins || true,
      logLevel: settings.logLevel || 'info',
      retentionDays: settings.retentionDays || 30
    }
  })
}
