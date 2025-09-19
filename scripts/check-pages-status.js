const { PrismaClient } = require('@prisma/client');

async function checkPagesStatus() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking pages status...');
    
    const pages = await prisma.page.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`\n📄 Found ${pages.length} pages:`);
    
    if (pages.length === 0) {
      console.log('❌ No pages found in database');
      return;
    }
    
    const statusCounts = {};
    
    pages.forEach((page, index) => {
      console.log(`${index + 1}. ${page.title}`);
      console.log(`   Slug: /${page.slug}`);
      console.log(`   Status: ${page.status}`);
      console.log(`   Created: ${page.createdAt}`);
      console.log('');
      
      statusCounts[page.status] = (statusCounts[page.status] || 0) + 1;
    });
    
    console.log('📊 Status Summary:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} pages`);
    });
    
    const draftPages = pages.filter(p => p.status === 'DRAFT');
    if (draftPages.length > 0) {
      console.log(`\n⚠️  ${draftPages.length} pages are in DRAFT status and won't show on frontend`);
    }
    
  } catch (error) {
    console.error('❌ Error checking pages:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPagesStatus();
