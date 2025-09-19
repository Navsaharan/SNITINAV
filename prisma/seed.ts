import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@snpitc.in' },
    update: {},
    create: {
      email: 'admin@snpitc.in',
      name: 'Administrator',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log('Created admin user:', adminUser.email)

  // Create initial site settings
  const settings = [
    { key: 'site_name', value: 'S.N. Pvt. Industrial Training Institute', type: 'STRING' },
    { key: 'site_description', value: 'Approved by Directorate of Technical Education, Govt. of Rajasthan. Affiliated to NCVT (DGE&T) Govt. of India since 2009', type: 'STRING' },
    { key: 'contact_address', value: 'D-117, Kaka Colony, Gandhi Vidhya Mandir, Teh.-Sardar Shahar, Dist. Churu', type: 'STRING' },
    { key: 'contact_phone', value: '01564-275628', type: 'STRING' },
    { key: 'contact_mobile', value: '9414947801', type: 'STRING' },
    { key: 'contact_email', value: 'snitcsrdr@gmail.com', type: 'STRING' },
    { key: 'primary_color', value: '#1e40af', type: 'COLOR' },
    { key: 'secondary_color', value: '#dc2626', type: 'COLOR' },
    { key: 'accent_color', value: '#059669', type: 'COLOR' },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: {
        key: setting.key,
        value: setting.value,
        type: setting.type as any,
      },
    })
  }

  console.log('Created initial settings')

  // Create main navigation menu items
  const menuItems = [
    { title: 'Home', url: '/', order: 1 },
    { title: 'About Us', url: '#', order: 2 },
    { title: 'Admissions', url: '#', order: 3 },
    { title: 'Facilities', url: '#', order: 4 },
    { title: 'Trainee', url: '#', order: 5 },
    { title: 'Staff', url: '#', order: 6 },
    { title: 'More', url: '#', order: 7 },
    { title: 'Gallery', url: '/gallery', order: 8 },
    { title: 'Feedback', url: '/feedback', order: 9 },
    { title: 'Contact', url: '/contact', order: 10 },
  ]

  for (const item of menuItems) {
    const existingItem = await prisma.menuItem.findFirst({
      where: { title: item.title }
    })

    if (!existingItem) {
      await prisma.menuItem.create({
        data: item,
      })
    }
  }

  console.log('Created navigation menu items')

  // Create initial pages
  const homePage = await prisma.page.upsert({
    where: { slug: 'home' },
    update: {},
    create: {
      title: 'Welcome to SN Pvt ITI',
      slug: 'home',
      description: 'S.N. Pvt. Industrial Training Institute welcomes you with Job oriented Industrial Training Courses.',
      content: 'S.N. Pvt. Industrial Training Institute welcomes you with Job oriented Industrial Training Courses. These courses help trainees for employment in public or private sector & Self employment...',
      metaTitle: 'S.N. Pvt. Industrial Training Institute',
      metaDesc: 'Job oriented Industrial Training Courses for employment in public or private sector & Self employment',
      status: 'PUBLISHED',
      createdById: adminUser.id,
    },
  })

  console.log('Created home page')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
