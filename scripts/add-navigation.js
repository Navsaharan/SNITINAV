const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addNavigation() {
  try {
    const count = await prisma.navigationItem.count();
    console.log('Current navigation items:', count);
    
    if (count === 0) {
      console.log('Adding navigation items...');
      
      const navItems = [
        { id: 'nav-home', title: 'Home', href: '/', order: 0, isVisible: true, linkType: 'internal' },
        { id: 'nav-about', title: 'About Us', href: null, order: 1, isVisible: true, linkType: 'dropdown' },
        { id: 'nav-about-institute', title: 'About Institute', href: '/about-institute', parentId: 'nav-about', order: 0, isVisible: true, linkType: 'internal' },
        { id: 'nav-admissions', title: 'Admissions', href: null, order: 2, isVisible: true, linkType: 'dropdown' },
        { id: 'nav-facilities', title: 'Facilities', href: null, order: 3, isVisible: true, linkType: 'dropdown' },
        { id: 'nav-gallery', title: 'Gallery', href: '/gallery', order: 7, isVisible: true, linkType: 'internal' },
        { id: 'nav-contact', title: 'Contact', href: '/contact', order: 9, isVisible: true, linkType: 'internal' }
      ];
      
      for (const item of navItems) {
        await prisma.navigationItem.create({ data: item });
      }
      
      console.log('Added', navItems.length, 'navigation items');
    }
    
    const finalCount = await prisma.navigationItem.count();
    console.log('Final navigation items count:', finalCount);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addNavigation();
