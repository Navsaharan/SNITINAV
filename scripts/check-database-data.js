const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseData() {
  try {
    console.log('Checking database contents...');
    
    const navigationCount = await prisma.navigationItem.count();
    console.log(`Navigation items: ${navigationCount}`);
    
    const settingsCount = await prisma.setting.count();
    console.log(`Settings: ${settingsCount}`);
    
    const usersCount = await prisma.user.count();
    console.log(`Users: ${usersCount}`);
    
    const pagesCount = await prisma.page.count();
    console.log(`Pages: ${pagesCount}`);
    
    if (navigationCount === 0) {
      console.log('\nNo navigation items found. Adding default navigation...');
      
      // Add basic navigation items
      await prisma.navigationItem.createMany({
        data: [
          {
            id: 'nav-home',
            title: 'Home',
            href: '/',
            order: 0,
            isVisible: true,
            linkType: 'internal'
          },
          {
            id: 'nav-about',
            title: 'About Us',
            href: '/about-us',
            order: 1,
            isVisible: true,
            linkType: 'internal'
          },
          {
            id: 'nav-contact',
            title: 'Contact',
            href: '/contact',
            order: 2,
            isVisible: true,
            linkType: 'internal'
          }
        ]
      });
      
      console.log('Added basic navigation items');
    }
    
    if (settingsCount === 0) {
      console.log('\nNo settings found. Adding default settings...');
      
      await prisma.setting.createMany({
        data: [
          { key: 'site_name', value: 'S.N. Pvt. Industrial Training Institute', type: 'STRING' },
          { key: 'site_description', value: 'Approved by Directorate of Technical Education', type: 'STRING' },
          { key: 'contact_email', value: 'snitcsrdr@gmail.com', type: 'STRING' }
        ]
      });
      
      console.log('Added basic settings');
    }
    
    console.log('\nDatabase check completed');
    
  } catch (error) {
    console.error('Database check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseData();
