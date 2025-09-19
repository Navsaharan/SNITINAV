import { NextRequest, NextResponse } from 'next/server'
import { buildSafeApiRoute } from '@/lib/build-safe-api'

// GET /api/smtp/config - Email client configuration
export const GET = buildSafeApiRoute(async (request: NextRequest) => {
  const url = new URL(request.url)
  const format = url.searchParams.get('format') || 'json'
  const client = url.searchParams.get('client')

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com'
  const domain = process.env.NEXT_PUBLIC_EMAIL_DOMAIN || 'institute.edu'

  const config = {
    smtp: {
      server: `${baseUrl}/api/smtp`,
      port: 587, // Standard submission port (simulated)
      security: 'STARTTLS',
      authentication: 'required',
      methods: ['PLAIN', 'LOGIN']
    },
    imap: {
      server: `${baseUrl}/api/imap`,
      port: 993, // Standard IMAP over SSL port (simulated)
      security: 'SSL/TLS',
      authentication: 'required'
    },
    pop3: {
      server: `${baseUrl}/api/pop3`,
      port: 995, // Standard POP3 over SSL port (simulated)
      security: 'SSL/TLS',
      authentication: 'required'
    },
    domain: domain,
    displayName: 'SNPITC Email Service'
  }

  // Return client-specific configuration
  if (client) {
    switch (client.toLowerCase()) {
      case 'outlook':
        return NextResponse.json(generateOutlookConfig(config))
      
      case 'thunderbird':
        return NextResponse.json(generateThunderbirdConfig(config))
      
      case 'apple':
      case 'mail':
        return NextResponse.json(generateAppleMailConfig(config))
      
      case 'android':
        return NextResponse.json(generateAndroidConfig(config))
      
      case 'ios':
        return NextResponse.json(generateiOSConfig(config))
      
      default:
        return NextResponse.json({
          error: 'Unsupported client',
          supportedClients: ['outlook', 'thunderbird', 'apple', 'android', 'ios']
        }, { status: 400 })
    }
  }

  // Return format-specific configuration
  switch (format.toLowerCase()) {
    case 'xml':
      return new NextResponse(generateAutoDiscoverXML(config), {
        headers: { 'Content-Type': 'application/xml' }
      })
    
    case 'autodiscover':
      return new NextResponse(generateAutoDiscoverXML(config), {
        headers: { 'Content-Type': 'application/xml' }
      })
    
    case 'thunderbird':
      return new NextResponse(generateThunderbirdXML(config), {
        headers: { 'Content-Type': 'application/xml' }
      })
    
    default:
      return NextResponse.json({
        service: 'SNPITC Email Configuration',
        ...config,
        instructions: {
          general: 'Use the provided server settings in your email client',
          authentication: 'Use your institutional email and password',
          security: 'Always use encrypted connections (SSL/TLS or STARTTLS)'
        },
        supportedFormats: ['json', 'xml', 'autodiscover', 'thunderbird'],
        supportedClients: ['outlook', 'thunderbird', 'apple', 'android', 'ios']
      })
  }
})

// Generate Outlook-specific configuration
function generateOutlookConfig(config: any) {
  return {
    client: 'Microsoft Outlook',
    instructions: 'Add account manually using these settings',
    settings: {
      accountType: 'IMAP',
      incomingServer: {
        server: config.imap.server,
        port: config.imap.port,
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
        serverTimeouts: 60
      }
    },
    steps: [
      '1. Open Outlook and go to File > Add Account',
      '2. Choose "Manual setup or additional server types"',
      '3. Select "POP or IMAP"',
      '4. Enter the server settings above',
      '5. Test account settings before finishing'
    ]
  }
}

// Generate Thunderbird-specific configuration
function generateThunderbirdConfig(config: any) {
  return {
    client: 'Mozilla Thunderbird',
    instructions: 'Use manual configuration with these settings',
    settings: {
      incoming: {
        protocol: 'IMAP',
        hostname: config.imap.server,
        port: config.imap.port,
        ssl: 'SSL/TLS',
        authentication: 'Normal password'
      },
      outgoing: {
        hostname: config.smtp.server,
        port: config.smtp.port,
        ssl: 'STARTTLS',
        authentication: 'Normal password'
      }
    },
    steps: [
      '1. Go to Account Settings > Account Actions > Add Mail Account',
      '2. Enter your name, email, and password',
      '3. Click "Manual config" when auto-detection fails',
      '4. Enter the server settings above',
      '5. Click "Re-test" and then "Create Account"'
    ]
  }
}

// Generate Apple Mail configuration
function generateAppleMailConfig(config: any) {
  return {
    client: 'Apple Mail',
    instructions: 'Add account using manual setup',
    settings: {
      accountType: 'IMAP',
      mailServer: config.imap.server,
      username: 'your-email@' + config.domain,
      password: 'your-password',
      incomingMailServer: {
        hostname: config.imap.server,
        port: config.imap.port,
        ssl: true
      },
      outgoingMailServer: {
        hostname: config.smtp.server,
        port: config.smtp.port,
        ssl: true,
        authentication: true
      }
    },
    steps: [
      '1. Open Mail app and go to Mail > Add Account',
      '2. Choose "Other Mail Account"',
      '3. Enter your email and password',
      '4. Use manual setup with the settings above',
      '5. Verify and save the account'
    ]
  }
}

// Generate Android configuration
function generateAndroidConfig(config: any) {
  return {
    client: 'Android Email',
    instructions: 'Manual setup for Android email apps',
    settings: {
      accountType: 'IMAP',
      incomingServer: {
        server: config.imap.server,
        port: config.imap.port,
        securityType: 'SSL/TLS'
      },
      outgoingServer: {
        server: config.smtp.server,
        port: config.smtp.port,
        securityType: 'STARTTLS',
        requireSignIn: true
      }
    },
    steps: [
      '1. Open Email app and tap "Add Account"',
      '2. Choose "Other" or "Manual setup"',
      '3. Select "IMAP account"',
      '4. Enter the server settings above',
      '5. Complete setup and sync'
    ]
  }
}

// Generate iOS configuration
function generateiOSConfig(config: any) {
  return {
    client: 'iOS Mail',
    instructions: 'Add email account on iPhone/iPad',
    settings: {
      accountType: 'IMAP',
      incomingMailServer: {
        hostname: config.imap.server,
        port: config.imap.port,
        ssl: true
      },
      outgoingMailServer: {
        hostname: config.smtp.server,
        port: config.smtp.port,
        ssl: true,
        authentication: true
      }
    },
    steps: [
      '1. Go to Settings > Mail > Accounts > Add Account',
      '2. Tap "Other" > "Add Mail Account"',
      '3. Enter your email details',
      '4. Use manual setup with the settings above',
      '5. Save and verify the account'
    ]
  }
}

// Generate Autodiscover XML for Outlook
function generateAutoDiscoverXML(config: any) {
  return `<?xml version="1.0" encoding="utf-8"?>
<Autodiscover xmlns="http://schemas.microsoft.com/exchange/autodiscover/responseschema/2006">
  <Response xmlns="http://schemas.microsoft.com/exchange/autodiscover/outlook/responseschema/2006a">
    <Account>
      <AccountType>email</AccountType>
      <Action>settings</Action>
      <Protocol>
        <Type>IMAP</Type>
        <Server>${config.imap.server}</Server>
        <Port>${config.imap.port}</Port>
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

// Generate Thunderbird autoconfig XML
function generateThunderbirdXML(config: any) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<clientConfig version="1.1">
  <emailProvider id="${config.domain}">
    <domain>${config.domain}</domain>
    <displayName>${config.displayName}</displayName>
    <displayShortName>SNPITC</displayShortName>
    <incomingServer type="imap">
      <hostname>${config.imap.server}</hostname>
      <port>${config.imap.port}</port>
      <socketType>SSL</socketType>
      <authentication>password-cleartext</authentication>
      <username>%EMAILADDRESS%</username>
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
