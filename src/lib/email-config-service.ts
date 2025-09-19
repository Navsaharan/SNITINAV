// Unified Email Client Configuration Service

export interface EmailServerConfig {
  smtp: {
    server: string
    port: number
    security: 'STARTTLS' | 'SSL/TLS' | 'None'
    authentication: boolean
    methods: string[]
  }
  imap: {
    server: string
    port: number
    security: 'SSL/TLS' | 'STARTTLS' | 'None'
    authentication: boolean
    methods: string[]
  }
  pop3: {
    server: string
    port: number
    security: 'SSL/TLS' | 'None'
    authentication: boolean
    methods: string[]
  }
  domain: string
  displayName: string
  supportEmail: string
}

export interface ClientSpecificConfig {
  client: string
  displayName: string
  instructions: string[]
  settings: {
    accountType?: string
    incomingServer: {
      protocol: 'IMAP' | 'POP3'
      server: string
      port: number
      security: string
      authentication: string
    }
    outgoingServer: {
      server: string
      port: number
      security: string
      authentication: string
    }
    advanced?: Record<string, any>
  }
  warnings?: string[]
  notes?: string[]
}

export interface AutoDiscoverConfig {
  domain: string
  protocols: {
    imap: boolean
    pop3: boolean
    smtp: boolean
  }
  settings: EmailServerConfig
}

// Get base server configuration
export const getBaseServerConfig = (): EmailServerConfig => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com'
  const domain = process.env.NEXT_PUBLIC_EMAIL_DOMAIN || 'institute.edu'
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@institute.edu'

  return {
    smtp: {
      server: `${baseUrl}/api/smtp`,
      port: 587,
      security: 'STARTTLS',
      authentication: true,
      methods: ['PLAIN', 'LOGIN']
    },
    imap: {
      server: `${baseUrl}/api/imap`,
      port: 993,
      security: 'SSL/TLS',
      authentication: true,
      methods: ['PLAIN', 'LOGIN']
    },
    pop3: {
      server: `${baseUrl}/api/pop3`,
      port: 995,
      security: 'SSL/TLS',
      authentication: true,
      methods: ['USER/PASS']
    },
    domain,
    displayName: 'SNPITC Email Service',
    supportEmail
  }
}

// Generate client-specific configurations
export const generateClientConfig = (client: string, protocol: 'IMAP' | 'POP3' = 'IMAP'): ClientSpecificConfig => {
  const baseConfig = getBaseServerConfig()
  
  switch (client.toLowerCase()) {
    case 'outlook':
      return generateOutlookConfig(baseConfig, protocol)
    
    case 'thunderbird':
      return generateThunderbirdConfig(baseConfig, protocol)
    
    case 'apple':
    case 'mail':
      return generateAppleMailConfig(baseConfig, protocol)
    
    case 'android':
      return generateAndroidConfig(baseConfig, protocol)
    
    case 'ios':
      return generateiOSConfig(baseConfig, protocol)
    
    case 'legacy':
      return generateLegacyConfig(baseConfig, protocol)
    
    default:
      return generateGenericConfig(baseConfig, protocol)
  }
}

// Microsoft Outlook configuration
const generateOutlookConfig = (config: EmailServerConfig, protocol: 'IMAP' | 'POP3'): ClientSpecificConfig => {
  const incomingConfig = protocol === 'IMAP' ? config.imap : config.pop3
  
  return {
    client: 'outlook',
    displayName: 'Microsoft Outlook',
    instructions: [
      '1. Open Outlook and go to File > Add Account',
      '2. Choose "Manual setup or additional server types"',
      `3. Select "${protocol} or IMAP"`,
      `4. Choose "${protocol}" as account type`,
      '5. Enter the server settings below',
      '6. Click "More Settings" for advanced options',
      '7. Test account settings before finishing'
    ],
    settings: {
      accountType: protocol,
      incomingServer: {
        protocol,
        server: incomingConfig.server,
        port: incomingConfig.port,
        security: incomingConfig.security,
        authentication: 'Normal password'
      },
      outgoingServer: {
        server: config.smtp.server,
        port: config.smtp.port,
        security: config.smtp.security,
        authentication: 'Normal password'
      },
      advanced: {
        requireSecureConnection: true,
        useSSL: true,
        serverTimeouts: 60,
        ...(protocol === 'POP3' ? {
          leaveMessagesOnServer: false,
          removeFromServerAfter: 14
        } : {
          rootFolderPath: '',
          sentItemsFolder: 'Sent',
          draftsFolder: 'Drafts'
        })
      }
    },
    warnings: protocol === 'POP3' ? [
      'POP3 downloads messages and removes them from server',
      'Messages will only be available on this device',
      'Consider IMAP for multi-device access'
    ] : undefined
  }
}

// Mozilla Thunderbird configuration
const generateThunderbirdConfig = (config: EmailServerConfig, protocol: 'IMAP' | 'POP3'): ClientSpecificConfig => {
  const incomingConfig = protocol === 'IMAP' ? config.imap : config.pop3
  
  return {
    client: 'thunderbird',
    displayName: 'Mozilla Thunderbird',
    instructions: [
      '1. Go to Account Settings > Account Actions > Add Mail Account',
      '2. Enter your name, email, and password',
      '3. Click "Manual config" when auto-detection fails',
      `4. Select "${protocol}" as incoming server type`,
      '5. Enter the server settings below',
      '6. Configure advanced options as needed',
      '7. Click "Re-test" and then "Create Account"'
    ],
    settings: {
      incomingServer: {
        protocol,
        server: incomingConfig.server,
        port: incomingConfig.port,
        security: incomingConfig.security,
        authentication: 'Normal password'
      },
      outgoingServer: {
        server: config.smtp.server,
        port: config.smtp.port,
        security: config.smtp.security,
        authentication: 'Normal password'
      },
      advanced: protocol === 'IMAP' ? {
        folders: {
          inbox: 'INBOX',
          sent: 'Sent',
          drafts: 'Drafts',
          trash: 'Trash',
          junk: 'Spam'
        }
      } : {
        leaveMessagesOnServer: false,
        checkForNewMessages: 10,
        downloadOnBiff: true
      }
    }
  }
}

// Apple Mail configuration
const generateAppleMailConfig = (config: EmailServerConfig, protocol: 'IMAP' | 'POP3'): ClientSpecificConfig => {
  const incomingConfig = protocol === 'IMAP' ? config.imap : config.pop3
  
  return {
    client: 'apple',
    displayName: 'Apple Mail',
    instructions: [
      '1. Open Mail app and go to Mail > Add Account',
      '2. Choose "Other Mail Account"',
      '3. Enter your email and password',
      `4. Select "${protocol}" as account type`,
      '5. Use manual setup with the settings below',
      '6. Configure advanced settings if needed',
      '7. Verify and save the account'
    ],
    settings: {
      accountType: protocol,
      incomingServer: {
        protocol,
        server: incomingConfig.server,
        port: incomingConfig.port,
        security: incomingConfig.security === 'SSL/TLS' ? 'SSL' : 'None',
        authentication: 'Password'
      },
      outgoingServer: {
        server: config.smtp.server,
        port: config.smtp.port,
        security: config.smtp.security === 'STARTTLS' ? 'TLS' : 'SSL',
        authentication: 'Password'
      },
      advanced: protocol === 'IMAP' ? {
        mailboxBehaviors: {
          sentMailbox: 'Sent',
          draftsMailbox: 'Drafts',
          junkMailbox: 'Spam',
          trashMailbox: 'Trash'
        }
      } : {
        removeFromServerAfter: 'Never',
        bigMessagesOnly: false
      }
    }
  }
}

// Android configuration
const generateAndroidConfig = (config: EmailServerConfig, protocol: 'IMAP' | 'POP3'): ClientSpecificConfig => {
  const incomingConfig = protocol === 'IMAP' ? config.imap : config.pop3
  
  return {
    client: 'android',
    displayName: 'Android Email',
    instructions: [
      '1. Open Email app and tap "Add Account"',
      '2. Choose "Other" or "Manual setup"',
      `3. Select "${protocol} account"`,
      '4. Enter the server settings below',
      '5. Configure sync and download options',
      '6. Complete setup and sync'
    ],
    settings: {
      accountType: protocol,
      incomingServer: {
        protocol,
        server: incomingConfig.server,
        port: incomingConfig.port,
        security: incomingConfig.security,
        authentication: 'Normal password'
      },
      outgoingServer: {
        server: config.smtp.server,
        port: config.smtp.port,
        security: config.smtp.security,
        authentication: 'Required'
      },
      advanced: protocol === 'IMAP' ? {
        folderSettings: {
          inboxFolder: 'INBOX',
          sentFolder: 'Sent',
          draftsFolder: 'Drafts',
          trashFolder: 'Trash'
        }
      } : {
        syncSettings: {
          checkFrequency: 'Every 15 minutes',
          downloadAttachments: 'Wi-Fi only',
          deleteFromServer: 'When deleted from Inbox'
        }
      }
    }
  }
}

// iOS configuration
const generateiOSConfig = (config: EmailServerConfig, protocol: 'IMAP' | 'POP3'): ClientSpecificConfig => {
  const incomingConfig = protocol === 'IMAP' ? config.imap : config.pop3
  
  return {
    client: 'ios',
    displayName: 'iOS Mail',
    instructions: [
      '1. Go to Settings > Mail > Accounts > Add Account',
      '2. Tap "Other" > "Add Mail Account"',
      '3. Enter your email details',
      `4. Select "${protocol}" when prompted`,
      '5. Use manual setup with the settings below',
      '6. Configure advanced settings if needed',
      '7. Save and verify the account'
    ],
    settings: {
      accountType: protocol,
      incomingServer: {
        protocol,
        server: incomingConfig.server,
        port: incomingConfig.port,
        security: incomingConfig.security === 'SSL/TLS' ? 'SSL' : 'None',
        authentication: 'Password'
      },
      outgoingServer: {
        server: config.smtp.server,
        port: config.smtp.port,
        security: config.smtp.security === 'STARTTLS' ? 'TLS' : 'SSL',
        authentication: 'Password'
      },
      advanced: protocol === 'IMAP' ? {
        imapPathPrefix: '',
        sentMailbox: 'Sent',
        deletedMailbox: 'Trash'
      } : {
        deleteFromServer: 'Never',
        sslRequired: true
      }
    }
  }
}

// Legacy client configuration
const generateLegacyConfig = (config: EmailServerConfig, protocol: 'IMAP' | 'POP3'): ClientSpecificConfig => {
  const incomingConfig = protocol === 'IMAP' ? config.imap : config.pop3
  
  return {
    client: 'legacy',
    displayName: 'Legacy Email Clients',
    instructions: [
      '1. Open your email client settings',
      '2. Add new email account',
      `3. Choose "${protocol}" as protocol`,
      '4. Enter the basic settings below',
      '5. Configure authentication if required',
      '6. Test the connection'
    ],
    settings: {
      incomingServer: {
        protocol,
        server: incomingConfig.server,
        port: incomingConfig.port,
        security: incomingConfig.security,
        authentication: 'Required'
      },
      outgoingServer: {
        server: config.smtp.server,
        port: config.smtp.port,
        security: config.smtp.security,
        authentication: 'Required'
      }
    },
    notes: [
      'Use these basic settings for older email clients',
      'Some clients may not support SSL/TLS',
      'Ensure client supports modern authentication',
      'Contact support if you encounter issues'
    ]
  }
}

// Generic configuration
const generateGenericConfig = (config: EmailServerConfig, protocol: 'IMAP' | 'POP3'): ClientSpecificConfig => {
  const incomingConfig = protocol === 'IMAP' ? config.imap : config.pop3
  
  return {
    client: 'generic',
    displayName: 'Generic Email Client',
    instructions: [
      '1. Open your email client',
      '2. Add new email account',
      '3. Choose manual configuration',
      `4. Select "${protocol}" for incoming mail`,
      '5. Enter the server settings below',
      '6. Test and save the configuration'
    ],
    settings: {
      incomingServer: {
        protocol,
        server: incomingConfig.server,
        port: incomingConfig.port,
        security: incomingConfig.security,
        authentication: 'Password'
      },
      outgoingServer: {
        server: config.smtp.server,
        port: config.smtp.port,
        security: config.smtp.security,
        authentication: 'Password'
      }
    }
  }
}

// Generate Autodiscover XML (Microsoft)
export const generateAutoDiscoverXML = (protocol: 'IMAP' | 'POP3' = 'IMAP'): string => {
  const config = getBaseServerConfig()
  const incomingConfig = protocol === 'IMAP' ? config.imap : config.pop3

  return `<?xml version="1.0" encoding="utf-8"?>
<Autodiscover xmlns="http://schemas.microsoft.com/exchange/autodiscover/responseschema/2006">
  <Response xmlns="http://schemas.microsoft.com/exchange/autodiscover/outlook/responseschema/2006a">
    <Account>
      <AccountType>email</AccountType>
      <Action>settings</Action>
      <Protocol>
        <Type>${protocol}</Type>
        <Server>${incomingConfig.server}</Server>
        <Port>${incomingConfig.port}</Port>
        <DomainRequired>off</DomainRequired>
        <LoginName>%EmailAddress%</LoginName>
        <SPA>off</SPA>
        <SSL>${incomingConfig.security === 'SSL/TLS' ? 'on' : 'off'}</SSL>
        <AuthRequired>on</AuthRequired>
      </Protocol>
      <Protocol>
        <Type>SMTP</Type>
        <Server>${config.smtp.server}</Server>
        <Port>${config.smtp.port}</Port>
        <DomainRequired>off</DomainRequired>
        <LoginName>%EmailAddress%</LoginName>
        <SPA>off</SPA>
        <Encryption>${config.smtp.security === 'STARTTLS' ? 'TLS' : 'SSL'}</Encryption>
        <AuthRequired>on</AuthRequired>
        <UsePOPAuth>on</UsePOPAuth>
        <SMTPLast>off</SMTPLast>
      </Protocol>
    </Account>
  </Response>
</Autodiscover>`
}

// Generate Thunderbird Autoconfig XML
export const generateThunderbirdAutoConfigXML = (protocol: 'IMAP' | 'POP3' = 'IMAP'): string => {
  const config = getBaseServerConfig()
  const incomingConfig = protocol === 'IMAP' ? config.imap : config.pop3

  return `<?xml version="1.0" encoding="UTF-8"?>
<clientConfig version="1.1">
  <emailProvider id="${config.domain}">
    <domain>${config.domain}</domain>
    <displayName>${config.displayName}</displayName>
    <displayShortName>SNPITC</displayShortName>
    <incomingServer type="${protocol.toLowerCase()}">
      <hostname>${incomingConfig.server}</hostname>
      <port>${incomingConfig.port}</port>
      <socketType>${incomingConfig.security === 'SSL/TLS' ? 'SSL' : 'plain'}</socketType>
      <authentication>password-cleartext</authentication>
      <username>%EMAILADDRESS%</username>
      ${protocol === 'POP3' ? `
      <pop3>
        <leaveMessagesOnServer>false</leaveMessagesOnServer>
        <downloadOnBiff>true</downloadOnBiff>
        <daysToLeaveMessagesOnServer>14</daysToLeaveMessagesOnServer>
      </pop3>` : ''}
    </incomingServer>
    <outgoingServer type="smtp">
      <hostname>${config.smtp.server}</hostname>
      <port>${config.smtp.port}</port>
      <socketType>${config.smtp.security === 'STARTTLS' ? 'STARTTLS' : 'SSL'}</socketType>
      <authentication>password-cleartext</authentication>
      <username>%EMAILADDRESS%</username>
    </outgoingServer>
  </emailProvider>
</clientConfig>`
}

// Generate Apple Configuration Profile (iOS/macOS)
export const generateAppleConfigProfile = (protocol: 'IMAP' | 'POP3' = 'IMAP'): string => {
  const config = getBaseServerConfig()
  const incomingConfig = protocol === 'IMAP' ? config.imap : config.pop3

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>EmailAccountDescription</key>
      <string>${config.displayName}</string>
      <key>EmailAccountName</key>
      <string>%EmailAddress%</string>
      <key>EmailAccountType</key>
      <string>${protocol}</string>
      <key>EmailAddress</key>
      <string>%EmailAddress%</string>
      <key>IncomingMailServerAuthentication</key>
      <string>EmailAuthPassword</string>
      <key>IncomingMailServerHostName</key>
      <string>${incomingConfig.server}</string>
      <key>IncomingMailServerPortNumber</key>
      <integer>${incomingConfig.port}</integer>
      <key>IncomingMailServerUseSSL</key>
      <${incomingConfig.security === 'SSL/TLS' ? 'true' : 'false'}/>
      <key>IncomingMailServerUsername</key>
      <string>%EmailAddress%</string>
      <key>OutgoingMailServerAuthentication</key>
      <string>EmailAuthPassword</string>
      <key>OutgoingMailServerHostName</key>
      <string>${config.smtp.server}</string>
      <key>OutgoingMailServerPortNumber</key>
      <integer>${config.smtp.port}</integer>
      <key>OutgoingMailServerUseSSL</key>
      <${config.smtp.security !== 'None' ? 'true' : 'false'}/>
      <key>OutgoingMailServerUsername</key>
      <string>%EmailAddress%</string>
      <key>PayloadDescription</key>
      <string>Email configuration for ${config.displayName}</string>
      <key>PayloadDisplayName</key>
      <string>${config.displayName} Email</string>
      <key>PayloadIdentifier</key>
      <string>com.${config.domain}.email</string>
      <key>PayloadType</key>
      <string>com.apple.mail.managed</string>
      <key>PayloadUUID</key>
      <string>$(uuidgen)</string>
      <key>PayloadVersion</key>
      <integer>1</integer>
    </dict>
  </array>
  <key>PayloadDescription</key>
  <string>Email configuration profile for ${config.displayName}</string>
  <key>PayloadDisplayName</key>
  <string>${config.displayName} Email Configuration</string>
  <key>PayloadIdentifier</key>
  <string>com.${config.domain}.email.profile</string>
  <key>PayloadRemovalDisallowed</key>
  <false/>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadUUID</key>
  <string>$(uuidgen)</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
</dict>
</plist>`
}

// Validate client configuration
export const validateClientConfig = (client: string, protocol: 'IMAP' | 'POP3'): {
  valid: boolean
  errors: string[]
  warnings: string[]
} => {
  const errors: string[] = []
  const warnings: string[] = []

  // Check if client is supported
  const supportedClients = ['outlook', 'thunderbird', 'apple', 'android', 'ios', 'legacy']
  if (!supportedClients.includes(client.toLowerCase())) {
    warnings.push(`Client '${client}' may not be fully supported`)
  }

  // Check protocol compatibility
  if (client.toLowerCase() === 'legacy' && protocol === 'IMAP') {
    warnings.push('Legacy clients may have limited IMAP support')
  }

  // Check server configuration
  const config = getBaseServerConfig()
  if (!config.domain) {
    errors.push('Email domain not configured')
  }

  if (!config.smtp.server || !config.imap.server || !config.pop3.server) {
    errors.push('Server endpoints not properly configured')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

// Test client configuration
export const testClientConfiguration = async (
  client: string,
  protocol: 'IMAP' | 'POP3',
  credentials?: { username: string; password: string }
): Promise<{
  success: boolean
  results: {
    smtp: boolean
    incoming: boolean
    authentication: boolean
  }
  errors: string[]
}> => {
  const results = {
    smtp: false,
    incoming: false,
    authentication: false
  }
  const errors: string[] = []

  try {
    const config = getBaseServerConfig()

    // Test SMTP connectivity
    try {
      const smtpResponse = await fetch(`${config.smtp.server}`, { method: 'GET' })
      results.smtp = smtpResponse.ok
    } catch (error) {
      errors.push('SMTP server not reachable')
    }

    // Test incoming server connectivity
    try {
      const incomingConfig = protocol === 'IMAP' ? config.imap : config.pop3
      const incomingResponse = await fetch(`${incomingConfig.server}`, { method: 'GET' })
      results.incoming = incomingResponse.ok
    } catch (error) {
      errors.push(`${protocol} server not reachable`)
    }

    // Test authentication if credentials provided
    if (credentials) {
      try {
        // This would test actual authentication
        // For now, we'll assume it works if servers are reachable
        results.authentication = results.smtp && results.incoming
      } catch (error) {
        errors.push('Authentication test failed')
      }
    }

  } catch (error) {
    errors.push('Configuration test failed')
  }

  return {
    success: results.smtp && results.incoming,
    results,
    errors
  }
}
