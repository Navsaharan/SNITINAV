import { NextRequest, NextResponse } from 'next/server'
import { buildSafeApiRoute } from '@/lib/build-safe-api'

// GET /api/pop3/config - POP3 client configuration
export const GET = buildSafeApiRoute(async (request: NextRequest) => {
  const url = new URL(request.url)
  const format = url.searchParams.get('format') || 'json'
  const client = url.searchParams.get('client')

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com'
  const domain = process.env.NEXT_PUBLIC_EMAIL_DOMAIN || 'institute.edu'

  const config = {
    pop3: {
      server: `${baseUrl}/api/pop3`,
      port: 995, // Standard POP3 over SSL port (simulated)
      security: 'SSL/TLS',
      authentication: 'required',
      methods: ['USER/PASS']
    },
    smtp: {
      server: `${baseUrl}/api/smtp`,
      port: 587, // Standard submission port (simulated)
      security: 'STARTTLS',
      authentication: 'required'
    },
    domain: domain,
    displayName: 'SNPITC Email Service',
    capabilities: [
      'TOP',
      'UIDL',
      'RESP-CODES',
      'AUTH-RESP-CODE',
      'PIPELINING',
      'USER'
    ]
  }

  // Return client-specific configuration
  if (client) {
    switch (client.toLowerCase()) {
      case 'outlook':
        return NextResponse.json(generateOutlookPOP3Config(config))
      
      case 'thunderbird':
        return NextResponse.json(generateThunderbirdPOP3Config(config))
      
      case 'apple':
      case 'mail':
        return NextResponse.json(generateAppleMailPOP3Config(config))
      
      case 'android':
        return NextResponse.json(generateAndroidPOP3Config(config))
      
      case 'ios':
        return NextResponse.json(generateiOSPOP3Config(config))
      
      case 'legacy':
        return NextResponse.json(generateLegacyPOP3Config(config))
      
      default:
        return NextResponse.json({
          error: 'Unsupported client',
          supportedClients: ['outlook', 'thunderbird', 'apple', 'android', 'ios', 'legacy']
        }, { status: 400 })
    }
  }

  // Return format-specific configuration
  switch (format.toLowerCase()) {
    case 'xml':
      return new NextResponse(generateAutoDiscoverPOP3XML(config), {
        headers: { 'Content-Type': 'application/xml' }
      })
    
    case 'autodiscover':
      return new NextResponse(generateAutoDiscoverPOP3XML(config), {
        headers: { 'Content-Type': 'application/xml' }
      })
    
    case 'thunderbird':
      return new NextResponse(generateThunderbirdPOP3XML(config), {
        headers: { 'Content-Type': 'application/xml' }
      })
    
    default:
      return NextResponse.json({
        service: 'SNPITC POP3 Configuration',
        ...config,
        instructions: {
          general: 'Use the provided server settings in your email client',
          authentication: 'Use your institutional email and password',
          security: 'Always use encrypted connections (SSL/TLS)',
          behavior: 'POP3 downloads messages and removes them from server',
          recommendation: 'Consider using IMAP for better multi-device access'
        },
        supportedFormats: ['json', 'xml', 'autodiscover', 'thunderbird'],
        supportedClients: ['outlook', 'thunderbird', 'apple', 'android', 'ios', 'legacy']
      })
  }
})

// Generate Outlook-specific POP3 configuration
function generateOutlookPOP3Config(config: any) {
  return {
    client: 'Microsoft Outlook',
    instructions: 'Add account manually using these settings',
    settings: {
      accountType: 'POP3',
      incomingServer: {
        server: config.pop3.server,
        port: config.pop3.port,
        encryption: 'SSL/TLS',
        authentication: 'Normal password'
      },
      outgoingServer: {
        server: config.smtp.server,
        port: config.smtp.port,
        encryption: 'STARTTLS',
        authentication: 'Normal password'
      },
      advanced: {
        requireSecureConnection: true,
        useSSL: true,
        serverTimeouts: 60,
        leaveMessagesOnServer: false, // POP3 default behavior
        removeFromServerAfter: 14 // days
      }
    },
    steps: [
      '1. Open Outlook and go to File > Add Account',
      '2. Choose "Manual setup or additional server types"',
      '3. Select "POP or IMAP"',
      '4. Choose "POP3" as account type',
      '5. Enter the server settings above',
      '6. Configure advanced settings as needed',
      '7. Test account settings before finishing'
    ],
    warnings: [
      'POP3 downloads messages and removes them from server',
      'Messages will only be available on this device',
      'Consider IMAP for multi-device access'
    ]
  }
}

// Generate Thunderbird-specific POP3 configuration
function generateThunderbirdPOP3Config(config: any) {
  return {
    client: 'Mozilla Thunderbird',
    instructions: 'Use manual configuration with these settings',
    settings: {
      incoming: {
        protocol: 'POP3',
        hostname: config.pop3.server,
        port: config.pop3.port,
        ssl: 'SSL/TLS',
        authentication: 'Normal password'
      },
      outgoing: {
        hostname: config.smtp.server,
        port: config.smtp.port,
        ssl: 'STARTTLS',
        authentication: 'Normal password'
      },
      options: {
        leaveMessagesOnServer: false,
        checkForNewMessages: 10, // minutes
        downloadOnBiff: true
      }
    },
    steps: [
      '1. Go to Account Settings > Account Actions > Add Mail Account',
      '2. Enter your name, email, and password',
      '3. Click "Manual config" when auto-detection fails',
      '4. Select "POP3" as incoming server type',
      '5. Enter the server settings above',
      '6. Configure message handling options',
      '7. Click "Re-test" and then "Create Account"'
    ]
  }
}

// Generate Apple Mail POP3 configuration
function generateAppleMailPOP3Config(config: any) {
  return {
    client: 'Apple Mail',
    instructions: 'Add account using manual setup',
    settings: {
      accountType: 'POP',
      mailServer: config.pop3.server,
      username: 'your-email@' + config.domain,
      password: 'your-password',
      incomingMailServer: {
        hostname: config.pop3.server,
        port: config.pop3.port,
        ssl: true,
        authentication: 'Password'
      },
      outgoingMailServer: {
        hostname: config.smtp.server,
        port: config.smtp.port,
        ssl: true,
        authentication: true
      },
      advancedOptions: {
        removeFromServerAfter: 'Never', // or specify days
        bigMessagesOnly: false
      }
    },
    steps: [
      '1. Open Mail app and go to Mail > Add Account',
      '2. Choose "Other Mail Account"',
      '3. Enter your email and password',
      '4. Select "POP" as account type',
      '5. Use manual setup with the settings above',
      '6. Configure advanced options as needed',
      '7. Verify and save the account'
    ]
  }
}

// Generate Android POP3 configuration
function generateAndroidPOP3Config(config: any) {
  return {
    client: 'Android Email',
    instructions: 'Manual setup for Android email apps',
    settings: {
      accountType: 'POP3',
      incomingServer: {
        server: config.pop3.server,
        port: config.pop3.port,
        securityType: 'SSL/TLS',
        authentication: 'Normal password'
      },
      outgoingServer: {
        server: config.smtp.server,
        port: config.smtp.port,
        securityType: 'STARTTLS',
        requireSignIn: true
      },
      syncSettings: {
        checkFrequency: 'Every 15 minutes',
        downloadAttachments: 'Wi-Fi only',
        deleteFromServer: 'When deleted from Inbox'
      }
    },
    steps: [
      '1. Open Email app and tap "Add Account"',
      '2. Choose "Other" or "Manual setup"',
      '3. Select "POP3 account"',
      '4. Enter the server settings above',
      '5. Configure sync and download options',
      '6. Complete setup and sync'
    ]
  }
}

// Generate iOS POP3 configuration
function generateiOSPOP3Config(config: any) {
  return {
    client: 'iOS Mail',
    instructions: 'Add email account on iPhone/iPad',
    settings: {
      accountType: 'POP',
      incomingMailServer: {
        hostname: config.pop3.server,
        port: config.pop3.port,
        ssl: true,
        authentication: 'Password'
      },
      outgoingMailServer: {
        hostname: config.smtp.server,
        port: config.smtp.port,
        ssl: true,
        authentication: true
      },
      advancedSettings: {
        deleteFromServer: 'Never', // or 'After 1 week', etc.
        sslRequired: true
      }
    },
    steps: [
      '1. Go to Settings > Mail > Accounts > Add Account',
      '2. Tap "Other" > "Add Mail Account"',
      '3. Enter your email details',
      '4. Select "POP" when prompted',
      '5. Use manual setup with the settings above',
      '6. Configure advanced settings if needed',
      '7. Save and verify the account'
    ]
  }
}

// Generate legacy client configuration
function generateLegacyPOP3Config(config: any) {
  return {
    client: 'Legacy Email Clients',
    instructions: 'Basic POP3 settings for older email clients',
    settings: {
      protocol: 'POP3',
      server: config.pop3.server,
      port: config.pop3.port,
      security: 'SSL/TLS',
      username: 'your-email@' + config.domain,
      password: 'your-password',
      smtpServer: config.smtp.server,
      smtpPort: config.smtp.port,
      smtpSecurity: 'STARTTLS'
    },
    compatibility: [
      'Outlook Express',
      'Windows Mail',
      'Eudora',
      'Pegasus Mail',
      'The Bat!',
      'Other RFC 1939 compliant clients'
    ],
    notes: [
      'Use these basic settings for older email clients',
      'Some clients may not support SSL/TLS',
      'Ensure client supports POP3 over SSL (port 995)',
      'Configure SMTP authentication if required'
    ]
  }
}

// Generate Autodiscover XML for POP3
function generateAutoDiscoverPOP3XML(config: any) {
  return `<?xml version="1.0" encoding="utf-8"?>
<Autodiscover xmlns="http://schemas.microsoft.com/exchange/autodiscover/responseschema/2006">
  <Response xmlns="http://schemas.microsoft.com/exchange/autodiscover/outlook/responseschema/2006a">
    <Account>
      <AccountType>email</AccountType>
      <Action>settings</Action>
      <Protocol>
        <Type>POP3</Type>
        <Server>${config.pop3.server}</Server>
        <Port>${config.pop3.port}</Port>
        <DomainRequired>off</DomainRequired>
        <LoginName>%EmailAddress%</LoginName>
        <SPA>off</SPA>
        <SSL>on</SSL>
        <AuthRequired>on</AuthRequired>
      </Protocol>
      <Protocol>
        <Type>SMTP</Type>
        <Server>${config.smtp.server}</Server>
        <Port>${config.smtp.port}</Port>
        <DomainRequired>off</DomainRequired>
        <LoginName>%EmailAddress%</LoginName>
        <SPA>off</SPA>
        <Encryption>TLS</Encryption>
        <AuthRequired>on</AuthRequired>
        <UsePOPAuth>on</UsePOPAuth>
        <SMTPLast>off</SMTPLast>
      </Protocol>
    </Account>
  </Response>
</Autodiscover>`
}

// Generate Thunderbird autoconfig XML for POP3
function generateThunderbirdPOP3XML(config: any) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<clientConfig version="1.1">
  <emailProvider id="${config.domain}">
    <domain>${config.domain}</domain>
    <displayName>${config.displayName}</displayName>
    <displayShortName>SNPITC</displayShortName>
    <incomingServer type="pop3">
      <hostname>${config.pop3.server}</hostname>
      <port>${config.pop3.port}</port>
      <socketType>SSL</socketType>
      <authentication>password-cleartext</authentication>
      <username>%EMAILADDRESS%</username>
      <pop3>
        <leaveMessagesOnServer>false</leaveMessagesOnServer>
        <downloadOnBiff>true</downloadOnBiff>
        <daysToLeaveMessagesOnServer>14</daysToLeaveMessagesOnServer>
      </pop3>
    </incomingServer>
    <outgoingServer type="smtp">
      <hostname>${config.smtp.server}</hostname>
      <port>${config.smtp.port}</port>
      <socketType>STARTTLS</socketType>
      <authentication>password-cleartext</authentication>
      <username>%EMAILADDRESS%</username>
    </outgoingServer>
  </emailProvider>
</clientConfig>`
}
