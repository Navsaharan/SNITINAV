const sqlite3 = require('sqlite3').verbose();
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const navjeetDbPath = path.join(__dirname, '..', 'navjeet.db');
const prisma = new PrismaClient();

async function exportAndMergeData() {
  return new Promise((resolve, reject) => {
    console.log('Exporting data from navjeet.db...');
    
    const navjeetDb = new sqlite3.Database(navjeetDbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error('Error opening navjeet.db:', err.message);
        reject(err);
        return;
      }
      console.log('Connected to navjeet.db');
    });

    // Get all table names
    navjeetDb.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", [], async (err, tables) => {
      if (err) {
        console.error('Error getting tables:', err.message);
        reject(err);
        return;
      }

      console.log(`Found ${tables.length} tables in navjeet.db:`, tables.map(t => t.name));

      try {
        for (const table of tables) {
          const tableName = table.name;
          console.log(`\nProcessing table: ${tableName}`);

          // Get data from navjeet.db
          const rows = await new Promise((resolveRows, rejectRows) => {
            navjeetDb.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
              if (err) rejectRows(err);
              else resolveRows(rows);
            });
          });

          if (rows.length === 0) {
            console.log(`No data in ${tableName}`);
            continue;
          }

          console.log(`Found ${rows.length} records in ${tableName}`);

          // Handle different tables based on current schema
          let insertedCount = 0;

          switch (tableName.toLowerCase()) {
            case 'users':
              for (const row of rows) {
                try {
                  // Check if user already exists
                  const existingUser = await prisma.user.findUnique({
                    where: { email: row.email }
                  });

                  if (!existingUser) {
                    await prisma.user.create({
                      data: {
                        id: row.id,
                        email: row.email,
                        name: row.name,
                        password: row.password,
                        role: row.role,
                        createdAt: new Date(row.createdAt),
                        updatedAt: new Date(row.updatedAt)
                      }
                    });
                    insertedCount++;
                  }
                } catch (error) {
                  console.log(`Skipping user ${row.email}:`, error.message);
                }
              }
              break;

            case 'pages':
              for (const row of rows) {
                try {
                  const existingPage = await prisma.page.findUnique({
                    where: { slug: row.slug }
                  });

                  if (!existingPage) {
                    await prisma.page.create({
                      data: {
                        id: row.id,
                        title: row.title,
                        slug: row.slug,
                        description: row.description,
                        content: row.content,
                        metaTitle: row.metaTitle,
                        metaDesc: row.metaDesc,
                        status: row.status,
                        parentId: row.parentId,
                        order: row.order,
                        navigationCategory: row.navigationCategory,
                        navigationOrder: row.navigationOrder || 0,
                        createdAt: new Date(row.createdAt),
                        updatedAt: new Date(row.updatedAt),
                        createdById: row.createdById
                      }
                    });
                    insertedCount++;
                  }
                } catch (error) {
                  console.log(`Skipping page ${row.slug}:`, error.message);
                }
              }
              break;

            case 'contents':
              for (const row of rows) {
                try {
                  const existingContent = await prisma.content.findUnique({
                    where: { id: row.id }
                  });

                  if (!existingContent) {
                    await prisma.content.create({
                      data: {
                        id: row.id,
                        type: row.type,
                        title: row.title,
                        content: row.content,
                        data: row.data,
                        order: row.order,
                        pageId: row.pageId,
                        createdAt: new Date(row.createdAt),
                        updatedAt: new Date(row.updatedAt),
                        createdById: row.createdById
                      }
                    });
                    insertedCount++;
                  }
                } catch (error) {
                  console.log(`Skipping content ${row.id}:`, error.message);
                }
              }
              break;

            case 'media':
              for (const row of rows) {
                try {
                  const existingMedia = await prisma.media.findUnique({
                    where: { id: row.id }
                  });

                  if (!existingMedia) {
                    await prisma.media.create({
                      data: {
                        id: row.id,
                        filename: row.filename,
                        originalName: row.originalName,
                        mimeType: row.mimeType,
                        size: row.size,
                        url: row.url,
                        alt: row.alt,
                        caption: row.caption,
                        category: row.category || 'GENERAL',
                        tags: row.tags,
                        createdAt: new Date(row.createdAt),
                        updatedAt: new Date(row.updatedAt),
                        createdById: row.createdById
                      }
                    });
                    insertedCount++;
                  }
                } catch (error) {
                  console.log(`Skipping media ${row.id}:`, error.message);
                }
              }
              break;

            case 'settings':
              for (const row of rows) {
                try {
                  await prisma.setting.upsert({
                    where: { key: row.key },
                    update: { value: row.value },
                    create: {
                      id: row.id,
                      key: row.key,
                      value: row.value,
                      type: row.type || 'STRING',
                      createdAt: new Date(row.createdAt),
                      updatedAt: new Date(row.updatedAt)
                    }
                  });
                  insertedCount++;
                } catch (error) {
                  console.log(`Skipping setting ${row.key}:`, error.message);
                }
              }
              break;

            case 'menu_items':
              for (const row of rows) {
                try {
                  const existingMenuItem = await prisma.menuItem.findUnique({
                    where: { id: row.id }
                  });

                  if (!existingMenuItem) {
                    await prisma.menuItem.create({
                      data: {
                        id: row.id,
                        title: row.title,
                        url: row.url,
                        pageId: row.pageId,
                        parentId: row.parentId,
                        order: row.order,
                        isActive: row.isActive,
                        createdAt: new Date(row.createdAt),
                        updatedAt: new Date(row.updatedAt)
                      }
                    });
                    insertedCount++;
                  }
                } catch (error) {
                  console.log(`Skipping menu item ${row.id}:`, error.message);
                }
              }
              break;

            case 'navigation_items':
              for (const row of rows) {
                try {
                  const existingNavItem = await prisma.navigationItem.findUnique({
                    where: { id: row.id }
                  });

                  if (!existingNavItem) {
                    await prisma.navigationItem.create({
                      data: {
                        id: row.id,
                        title: row.title,
                        href: row.href,
                        parentId: row.parentId,
                        order: row.order,
                        isVisible: row.isVisible,
                        linkType: row.linkType || 'internal',
                        target: row.target || '_self',
                        description: row.description,
                        icon: row.icon,
                        cssClass: row.cssClass,
                        createdAt: new Date(row.createdAt),
                        updatedAt: new Date(row.updatedAt)
                      }
                    });
                    insertedCount++;
                  }
                } catch (error) {
                  console.log(`Skipping navigation item ${row.id}:`, error.message);
                }
              }
              break;

            case 'faculty':
              for (const row of rows) {
                try {
                  const existingFaculty = await prisma.faculty.findUnique({
                    where: { id: row.id }
                  });

                  if (!existingFaculty) {
                    await prisma.faculty.create({
                      data: {
                        id: row.id,
                        name: row.name,
                        designation: row.designation,
                        department: row.department,
                        email: row.email,
                        phone: row.phone,
                        photoUrl: row.photoUrl,
                        bio: row.bio,
                        order: row.order,
                        isActive: row.isActive,
                        createdAt: new Date(row.createdAt),
                        updatedAt: new Date(row.updatedAt)
                      }
                    });
                    insertedCount++;
                  }
                } catch (error) {
                  console.log(`Skipping faculty ${row.id}:`, error.message);
                }
              }
              break;

            case 'contact_messages':
              for (const row of rows) {
                try {
                  const existingMessage = await prisma.contactMessage.findUnique({
                    where: { id: row.id }
                  });

                  if (!existingMessage) {
                    await prisma.contactMessage.create({
                      data: {
                        id: row.id,
                        name: row.name,
                        email: row.email,
                        contact: row.contact,
                        subject: row.subject,
                        message: row.message,
                        isRead: row.isRead,
                        createdAt: new Date(row.createdAt),
                        updatedAt: new Date(row.updatedAt)
                      }
                    });
                    insertedCount++;
                  }
                } catch (error) {
                  console.log(`Skipping contact message ${row.id}:`, error.message);
                }
              }
              break;

            case 'page_views':
              for (const row of rows) {
                try {
                  await prisma.pageView.create({
                    data: {
                      id: row.id,
                      pageSlug: row.pageSlug,
                      userAgent: row.userAgent,
                      ipAddress: row.ipAddress,
                      referer: row.referer,
                      createdAt: new Date(row.createdAt)
                    }
                  });
                  insertedCount++;
                } catch (error) {
                  console.log(`Skipping page view ${row.id}:`, error.message);
                }
              }
              break;

            default:
              console.log(`Table ${tableName} not handled - no matching schema`);
          }

          console.log(`Inserted ${insertedCount} new records into ${tableName}`);
        }

        navjeetDb.close();
        await prisma.$disconnect();
        resolve();

      } catch (error) {
        navjeetDb.close();
        await prisma.$disconnect();
        reject(error);
      }
    });
  });
}

// Run the export and merge
exportAndMergeData()
  .then(() => {
    console.log('\nData merge from navjeet.db completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Data merge failed:', error);
    process.exit(1);
  });
