const required = ['DATABASE_URL', 'NEXTAUTH_SECRET']
const missing = required.filter((name) => !process.env[name])

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`)
  process.exit(1)
}

console.log('Environment validation passed')
