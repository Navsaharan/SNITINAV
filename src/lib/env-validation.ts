/**
 * Environment Variable Validation for Production Deployment
 * Ensures all required environment variables are properly configured
 */

interface EnvConfig {
  // Database
  DATABASE_URL: string
  
  // Supabase
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  
  // NextAuth.js
  NEXTAUTH_SECRET: string
  NEXTAUTH_URL: string
  
  // Admin Credentials
  ADMIN_EMAIL: string
  ADMIN_PASSWORD: string
  
  // Site Configuration
  SITE_NAME?: string
  SITE_URL?: string
  
  // Optional: Email Configuration
  EMAIL_DOMAIN?: string
  EMAIL_ADMIN?: string
  
  // Optional: Payment Gateways
  RAZORPAY_KEY_ID?: string
  RAZORPAY_KEY_SECRET?: string
  STRIPE_PUBLISHABLE_KEY?: string
  STRIPE_SECRET_KEY?: string
}

const requiredEnvVars = [
  'DATABASE_URL',
  'SUPABASE_URL', 
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD'
] as const

const optionalEnvVars = [
  'SITE_NAME',
  'SITE_URL',
  'EMAIL_DOMAIN',
  'EMAIL_ADMIN',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY'
] as const

export function validateEnvironmentVariables(): {
  isValid: boolean
  errors: string[]
  warnings: string[]
  config: Partial<EnvConfig>
} {
  const errors: string[] = []
  const warnings: string[] = []
  const config: Partial<EnvConfig> = {}

  // Skip validation during build time
  if (process.env.NEXT_PHASE === 'phase-production-build' || 
      process.env.SKIP_ENV_VALIDATION === 'true') {
    return {
      isValid: true,
      errors: [],
      warnings: ['Environment validation skipped during build'],
      config: {}
    }
  }

  // Validate required environment variables
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar]
    
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${envVar}`)
    } else {
      // Additional validation for specific variables
      switch (envVar) {
        case 'DATABASE_URL':
          if (!value.startsWith('postgresql://')) {
            errors.push('DATABASE_URL must be a valid PostgreSQL connection string')
          }
          break
          
        case 'SUPABASE_URL':
          if (!value.startsWith('https://') || !value.includes('.supabase.co')) {
            errors.push('SUPABASE_URL must be a valid Supabase project URL')
          }
          break
          
        case 'NEXTAUTH_URL':
          if (!value.startsWith('http://') && !value.startsWith('https://')) {
            errors.push('NEXTAUTH_URL must be a valid URL')
          }
          break
          
        case 'ADMIN_EMAIL':
          if (!value.includes('@')) {
            errors.push('ADMIN_EMAIL must be a valid email address')
          }
          break
          
        case 'NEXTAUTH_SECRET':
          if (value.length < 32) {
            warnings.push('NEXTAUTH_SECRET should be at least 32 characters long for security')
          }
          break
      }
      
      config[envVar] = value
    }
  }

  // Check optional environment variables
  for (const envVar of optionalEnvVars) {
    const value = process.env[envVar]
    if (value && value.trim() !== '') {
      config[envVar] = value
    }
  }

  // Environment-specific validations
  if (process.env.NODE_ENV === 'production') {
    // Production-specific checks
    if (config.NEXTAUTH_URL?.includes('localhost')) {
      errors.push('NEXTAUTH_URL cannot use localhost in production')
    }
    
    if (config.NEXTAUTH_SECRET === 'snpitc-nextauth-secret-2024-fixed-client-fetch-error-development') {
      warnings.push('Using development NEXTAUTH_SECRET in production - consider generating a new secret')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config: config as EnvConfig
  }
}

export function logEnvironmentStatus() {
  const validation = validateEnvironmentVariables()
  
  if (validation.isValid) {
    console.log('✅ Environment variables validation passed')
    
    if (validation.warnings.length > 0) {
      console.log('⚠️ Environment warnings:')
      validation.warnings.forEach(warning => console.log(`  - ${warning}`))
    }
  } else {
    console.error('❌ Environment variables validation failed:')
    validation.errors.forEach(error => console.error(`  - ${error}`))
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Environment validation failed in production')
    }
  }
  
  return validation
}

// Auto-validate on import in non-build environments
if (typeof window === 'undefined' && 
    process.env.NEXT_PHASE !== 'phase-production-build' &&
    process.env.SKIP_ENV_VALIDATION !== 'true') {
  logEnvironmentStatus()
}
