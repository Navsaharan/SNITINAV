const sqlite3 = require('sqlite3').verbose();
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const navjeetDbPath = path.join(__dirname, '..', 'navjeet.db');
const prisma = new PrismaClient();

async function migrateNavjeetData() {
  return new Promise((resolve, reject) => {
    console.log('Starting migration from navjeet.db...');
    
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

      console.log(`Found ${tables.length} tables in navjeet.db`);

      try {
        let totalMigrated = 0;

        // Migrate users
        const users = await new Promise((resolveUsers, rejectUsers) => {
          navjeetDb.all("SELECT * FROM users", [], (err, rows) => {
            if (err) rejectUsers(err);
            else resolveUsers(rows);
          });
        });

        console.log(`\nMigrating ${users.length} users...`);
        let userCount = 0;
        for (const user of users) {
          try {
            const existing = await prisma.user.findUnique({ where: { email: user.email } });
            if (!existing) {
              await prisma.user.create({
                data: {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  password: user.password,
                  role: user.role,
                  createdAt: new Date(user.createdAt),
                  updatedAt: new Date(user.updatedAt)
                }
              });
              userCount++;
            }
          } catch (error) {
            console.log(`Skipping user ${user.email}: ${error.message}`);
          }
        }
        console.log(`Migrated ${userCount} new users`);
        totalMigrated += userCount;

        // Migrate pages
        const pages = await new Promise((resolvePages, rejectPages) => {
          navjeetDb.all("SELECT * FROM pages", [], (err, rows) => {
            if (err) rejectPages(err);
            else resolvePages(rows);
          });
        });

        console.log(`\nMigrating ${pages.length} pages...`);
        let pageCount = 0;
        for (const page of pages) {
          try {
            const existing = await prisma.page.findUnique({ where: { slug: page.slug } });
            if (!existing) {
              await prisma.page.create({
                data: {
                  id: page.id,
                  title: page.title,
                  slug: page.slug,
                  description: page.description,
                  content: page.content,
                  metaTitle: page.metaTitle,
                  metaDesc: page.metaDesc,
                  status: page.status,
                  parentId: page.parentId,
                  order: page.order,
                  navigationCategory: page.navigationCategory,
                  navigationOrder: page.navigationOrder || 0,
                  createdAt: new Date(page.createdAt),
                  updatedAt: new Date(page.updatedAt),
                  createdById: page.createdById
                }
              });
              pageCount++;
            }
          } catch (error) {
            console.log(`Skipping page ${page.slug}: ${error.message}`);
          }
        }
        console.log(`Migrated ${pageCount} new pages`);
        totalMigrated += pageCount;

        // Migrate contents
        const contents = await new Promise((resolveContents, rejectContents) => {
          navjeetDb.all("SELECT * FROM contents", [], (err, rows) => {
            if (err) rejectContents(err);
            else resolveContents(rows);
          });
        });

        console.log(`\nMigrating ${contents.length} content blocks...`);
        let contentCount = 0;
        for (const content of contents) {
          try {
            const existing = await prisma.content.findUnique({ where: { id: content.id } });
            if (!existing) {
              await prisma.content.create({
                data: {
                  id: content.id,
                  type: content.type,
                  title: content.title,
                  content: content.content,
                  data: content.data,
                  order: content.order,
                  pageId: content.pageId,
                  createdAt: new Date(content.createdAt),
                  updatedAt: new Date(content.updatedAt),
                  createdById: content.createdById
                }
              });
              contentCount++;
            }
          } catch (error) {
            console.log(`Skipping content ${content.id}: ${error.message}`);
          }
        }
        console.log(`Migrated ${contentCount} new content blocks`);
        totalMigrated += contentCount;

        // Migrate media
        const media = await new Promise((resolveMedia, rejectMedia) => {
          navjeetDb.all("SELECT * FROM media", [], (err, rows) => {
            if (err) rejectMedia(err);
            else resolveMedia(rows);
          });
        });

        console.log(`\nMigrating ${media.length} media files...`);
        let mediaCount = 0;
        for (const mediaItem of media) {
          try {
            const existing = await prisma.media.findUnique({ where: { id: mediaItem.id } });
            if (!existing) {
              await prisma.media.create({
                data: {
                  id: mediaItem.id,
                  filename: mediaItem.filename,
                  originalName: mediaItem.originalName,
                  mimeType: mediaItem.mimeType,
                  size: mediaItem.size,
                  url: mediaItem.url,
                  alt: mediaItem.alt,
                  caption: mediaItem.caption,
                  category: mediaItem.category || 'GENERAL',
                  tags: mediaItem.tags,
                  createdAt: new Date(mediaItem.createdAt),
                  updatedAt: new Date(mediaItem.updatedAt),
                  createdById: mediaItem.createdById
                }
              });
              mediaCount++;
            }
          } catch (error) {
            console.log(`Skipping media ${mediaItem.id}: ${error.message}`);
          }
        }
        console.log(`Migrated ${mediaCount} new media files`);
        totalMigrated += mediaCount;

        // Migrate settings
        const settings = await new Promise((resolveSettings, rejectSettings) => {
          navjeetDb.all("SELECT * FROM settings", [], (err, rows) => {
            if (err) rejectSettings(err);
            else resolveSettings(rows);
          });
        });

        console.log(`\nMigrating ${settings.length} settings...`);
        let settingCount = 0;
        for (const setting of settings) {
          try {
            await prisma.setting.upsert({
              where: { key: setting.key },
              update: { 
                value: setting.value,
                type: setting.type || 'STRING'
              },
              create: {
                id: setting.id,
                key: setting.key,
                value: setting.value,
                type: setting.type || 'STRING',
                createdAt: new Date(setting.createdAt),
                updatedAt: new Date(setting.updatedAt)
              }
            });
            settingCount++;
          } catch (error) {
            console.log(`Skipping setting ${setting.key}: ${error.message}`);
          }
        }
        console.log(`Migrated ${settingCount} settings`);
        totalMigrated += settingCount;

        // Migrate faculty
        const faculty = await new Promise((resolveFaculty, rejectFaculty) => {
          navjeetDb.all("SELECT * FROM faculty", [], (err, rows) => {
            if (err) rejectFaculty(err);
            else resolveFaculty(rows);
          });
        });

        console.log(`\nMigrating ${faculty.length} faculty members...`);
        let facultyCount = 0;
        for (const facultyMember of faculty) {
          try {
            const existing = await prisma.faculty.findUnique({ where: { id: facultyMember.id } });
            if (!existing) {
              await prisma.faculty.create({
                data: {
                  id: facultyMember.id,
                  name: facultyMember.name,
                  designation: facultyMember.designation,
                  department: facultyMember.department,
                  email: facultyMember.email,
                  phone: facultyMember.phone,
                  photoUrl: facultyMember.photoUrl,
                  bio: facultyMember.bio,
                  order: facultyMember.order,
                  isActive: facultyMember.isActive !== 0,
                  createdAt: new Date(facultyMember.createdAt),
                  updatedAt: new Date(facultyMember.updatedAt)
                }
              });
              facultyCount++;
            }
          } catch (error) {
            console.log(`Skipping faculty ${facultyMember.id}: ${error.message}`);
          }
        }
        console.log(`Migrated ${facultyCount} new faculty members`);
        totalMigrated += facultyCount;

        // Migrate menu items
        const menuItems = await new Promise((resolveMenuItems, rejectMenuItems) => {
          navjeetDb.all("SELECT * FROM menu_items", [], (err, rows) => {
            if (err) rejectMenuItems(err);
            else resolveMenuItems(rows);
          });
        });

        console.log(`\nMigrating ${menuItems.length} menu items...`);
        let menuCount = 0;
        for (const menuItem of menuItems) {
          try {
            const existing = await prisma.menuItem.findUnique({ where: { id: menuItem.id } });
            if (!existing) {
              await prisma.menuItem.create({
                data: {
                  id: menuItem.id,
                  title: menuItem.title,
                  url: menuItem.url,
                  pageId: menuItem.pageId,
                  parentId: menuItem.parentId,
                  order: menuItem.order,
                  isActive: menuItem.isActive !== 0,
                  createdAt: new Date(menuItem.createdAt),
                  updatedAt: new Date(menuItem.updatedAt)
                }
              });
              menuCount++;
            }
          } catch (error) {
            console.log(`Skipping menu item ${menuItem.id}: ${error.message}`);
          }
        }
        console.log(`Migrated ${menuCount} new menu items`);
        totalMigrated += menuCount;

        navjeetDb.close();
        await prisma.$disconnect();
        
        console.log(`\n✅ Migration completed successfully!`);
        console.log(`Total records migrated: ${totalMigrated}`);
        resolve(totalMigrated);

      } catch (error) {
        navjeetDb.close();
        await prisma.$disconnect();
        reject(error);
      }
    });
  });
}

// Run the migration
migrateNavjeetData()
  .then((total) => {
    console.log(`\nNavjeet.db migration finished - ${total} records migrated`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
