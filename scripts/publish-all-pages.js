const { PrismaClient } = require('@prisma/client');

async function publishAllPages() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Publishing all draft pages...');
    
    // Get all draft pages
    const draftPages = await prisma.page.findMany({
      where: {
        status: 'DRAFT'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true
      }
    });
    
    console.log(`Found ${draftPages.length} draft pages to publish`);
    
    if (draftPages.length === 0) {
      console.log('✅ No draft pages found - all pages are already published');
      return;
    }
    
    // Update all draft pages to published
    const result = await prisma.page.updateMany({
      where: {
        status: 'DRAFT'
      },
      data: {
        status: 'PUBLISHED'
      }
    });
    
    console.log(`✅ Successfully published ${result.count} pages`);
    
    // Show updated status
    const publishedPages = await prisma.page.findMany({
      select: {
        title: true,
        slug: true,
        status: true
      },
      orderBy: {
        title: 'asc'
      }
    });
    
    console.log('\n📄 All pages status:');
    publishedPages.forEach((page, index) => {
      console.log(`${index + 1}. ${page.title} (/${page.slug}) - ${page.status}`);
    });
    
    const statusCounts = publishedPages.reduce((acc, page) => {
      acc[page.status] = (acc[page.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📊 Final Status Summary:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} pages`);
    });
    
  } catch (error) {
    console.error('❌ Error publishing pages:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

publishAllPages();
