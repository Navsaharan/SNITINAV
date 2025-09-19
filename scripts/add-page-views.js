const { PrismaClient } = require('@prisma/client');

async function addPageViews() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Adding sample page views...');
    
    // Add some sample page views for testing
    const sampleViews = [
      { pageSlug: 'home', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', ipAddress: '192.168.1.1' },
      { pageSlug: 'about-institute', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', ipAddress: '192.168.1.2' },
      { pageSlug: 'contact', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', ipAddress: '192.168.1.3' },
      { pageSlug: 'gallery', userAgent: 'Mozilla/5.0 (X11; Linux x86_64)', ipAddress: '192.168.1.4' },
      { pageSlug: 'home', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)', ipAddress: '192.168.1.5' }
    ];
    
    for (const view of sampleViews) {
      await prisma.pageView.create({
        data: view
      });
    }
    
    const totalViews = await prisma.pageView.count();
    console.log(`✅ Added ${sampleViews.length} page views`);
    console.log(`📊 Total page views in database: ${totalViews}`);
    
    // Show page view stats
    const viewStats = await prisma.pageView.groupBy({
      by: ['pageSlug'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });
    
    console.log('\n📈 Page view statistics:');
    viewStats.forEach(stat => {
      console.log(`   ${stat.pageSlug}: ${stat._count.id} views`);
    });
    
  } catch (error) {
    console.error('❌ Error adding page views:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addPageViews();
