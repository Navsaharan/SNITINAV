import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function ensureSettingsTable() {
  try {
    // Check if settings table exists
    const setting = await prisma.setting.findFirst()
    console.log('Settings table exists and is accessible')
    return true
  } catch (error) {
    console.error('Error accessing settings table:', error)
    console.log('Attempting to create settings table...')
    
    try {
      // Try to create the settings table
      await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "Setting" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "key" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Setting_key_key" UNIQUE ("key")
      )`
      
      console.log('Successfully created settings table')
      return true
    } catch (err) {
      console.error('Failed to create settings table:', err)
      return false
    }
  }
}

// Run the function
ensureSettingsTable()
  .then((success) => {
    if (success) {
      console.log('Database check/update completed successfully')
    } else {
      console.error('Failed to ensure settings table exists')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('Unexpected error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
