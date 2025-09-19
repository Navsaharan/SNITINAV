const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    
    const userCount = await prisma.user.count();
    const settingsCount = await prisma.setting.count();
    const navCount = await prisma.navigationItem.count();
    
    console.log('✅ Database connection successful!');
    console.log('📊 Database stats:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Settings: ${settingsCount}`);
    console.log(`   Navigation items: ${navCount}`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
