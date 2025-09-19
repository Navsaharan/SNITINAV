const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');
const path = require('path');

const navjeetDbPath = path.join(__dirname, '..', 'navjeet.db');

// Supabase connection string
const SUPABASE_URL = process.env.SUPABASE_URL || 'postgresql://postgres:Navsaharan89%40@db.yemsrezmtmewkfflckxn.supabase.co:5432/postgres';

async function setupSupabaseDatabase() {
  console.log('🚀 Setting up Supabase PostgreSQL database...');
  
  if (SUPABASE_URL.includes('[YOUR-PASSWORD]') || SUPABASE_URL.includes('[YOUR-PROJECT-REF]')) {
    console.log('❌ Please update the SUPABASE_URL in the script or set it as an environment variable');
    console.log('Get your connection string from: Supabase Dashboard > Settings > Database');
    return;
  }

  const sqliteDb = new sqlite3.Database(navjeetDbPath, sqlite3.OPEN_READONLY);
  const pgClient = new Client({ connectionString: SUPABASE_URL });

  try {
    console.log('Connecting to Supabase...');
    await pgClient.connect();
    
    console.log('✅ Connected to Supabase PostgreSQL');
    
    // Create tables
    console.log('Creating database schema...');
    
    const createTablesSQL = `
      -- Enable UUID extension
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'EDITOR',
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- Pages table
      CREATE TABLE IF NOT EXISTS pages (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        content TEXT,
        "metaTitle" TEXT,
        "metaDesc" TEXT,
        status TEXT NOT NULL DEFAULT 'DRAFT',
        "parentId" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "navigationCategory" TEXT,
        "navigationOrder" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "createdById" TEXT NOT NULL,
        FOREIGN KEY ("createdById") REFERENCES users(id),
        FOREIGN KEY ("parentId") REFERENCES pages(id)
      );

      -- Contents table
      CREATE TABLE IF NOT EXISTS contents (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        type TEXT NOT NULL,
        title TEXT,
        content TEXT,
        data TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "pageId" TEXT NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "createdById" TEXT NOT NULL,
        FOREIGN KEY ("pageId") REFERENCES pages(id) ON DELETE CASCADE,
        FOREIGN KEY ("createdById") REFERENCES users(id)
      );

      -- Settings table
      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'STRING',
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- Navigation items table
      CREATE TABLE IF NOT EXISTS navigation_items (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        title TEXT NOT NULL,
        href TEXT,
        "parentId" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "isVisible" BOOLEAN NOT NULL DEFAULT true,
        "linkType" TEXT NOT NULL DEFAULT 'internal',
        target TEXT DEFAULT '_self',
        description TEXT,
        icon TEXT,
        "cssClass" TEXT,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        FOREIGN KEY ("parentId") REFERENCES navigation_items(id) ON DELETE CASCADE
      );

      -- Faculty table
      CREATE TABLE IF NOT EXISTS faculty (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT NOT NULL,
        designation TEXT NOT NULL,
        department TEXT,
        email TEXT,
        phone TEXT,
        "photoUrl" TEXT,
        bio TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- Media table
      CREATE TABLE IF NOT EXISTS media (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        filename TEXT NOT NULL,
        "originalName" TEXT NOT NULL,
        "mimeType" TEXT NOT NULL,
        size INTEGER NOT NULL,
        url TEXT NOT NULL,
        alt TEXT,
        caption TEXT,
        category TEXT NOT NULL DEFAULT 'GENERAL',
        tags TEXT,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "createdById" TEXT NOT NULL,
        FOREIGN KEY ("createdById") REFERENCES users(id)
      );

      -- Menu items table
      CREATE TABLE IF NOT EXISTS menu_items (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        title TEXT NOT NULL,
        url TEXT,
        "pageId" TEXT,
        "parentId" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        FOREIGN KEY ("parentId") REFERENCES menu_items(id)
      );

      -- Contact messages table
      CREATE TABLE IF NOT EXISTS contact_messages (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        contact TEXT,
        subject TEXT,
        message TEXT NOT NULL,
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- Page views table
      CREATE TABLE IF NOT EXISTS page_views (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "pageSlug" TEXT NOT NULL,
        "userAgent" TEXT,
        "ipAddress" TEXT,
        referer TEXT,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_navigation_items_parent_id ON navigation_items("parentId");
      CREATE INDEX IF NOT EXISTS idx_navigation_items_order ON navigation_items("order");
      CREATE INDEX IF NOT EXISTS idx_navigation_items_is_visible ON navigation_items("isVisible");
      CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
      CREATE INDEX IF NOT EXISTS idx_contents_page_id ON contents("pageId");
      CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
    `;

    await pgClient.query(createTablesSQL);
    console.log('✅ Database schema created successfully');

    // Migrate data from SQLite
    console.log('Starting data migration from navjeet.db...');

    const tables = await new Promise((resolve, reject) => {
      sqliteDb.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log(`Found ${tables.length} tables to migrate`);
    let totalRecords = 0;

    for (const table of tables) {
      const tableName = table.name;
      console.log(`\nMigrating table: ${tableName}`);

      const rows = await new Promise((resolve, reject) => {
        sqliteDb.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      if (rows.length === 0) {
        console.log(`No data in ${tableName}`);
        continue;
      }

      console.log(`Found ${rows.length} records in ${tableName}`);

      const columns = await new Promise((resolve, reject) => {
        sqliteDb.all(`PRAGMA table_info(${tableName})`, [], (err, cols) => {
          if (err) reject(err);
          else resolve(cols);
        });
      });

      const columnNames = columns.map(col => col.name);
      
      // Convert table name to PostgreSQL format
      const pgTableName = tableName === 'navigation_items' ? 'navigation_items' : 
                         tableName === 'contact_messages' ? 'contact_messages' :
                         tableName === 'page_views' ? 'page_views' :
                         tableName === 'menu_items' ? 'menu_items' : tableName;

      let insertedCount = 0;
      for (const row of rows) {
        try {
          const values = columnNames.map(col => {
            let value = row[col];
            // Convert SQLite timestamps to PostgreSQL timestamps
            if (col.includes('At') || col.includes('createdAt') || col.includes('updatedAt')) {
              if (typeof value === 'number') {
                value = new Date(value).toISOString();
              }
            }
            // Convert SQLite boolean values
            if (typeof value === 'number' && (col.includes('isActive') || col.includes('isVisible') || col.includes('isRead'))) {
              value = value === 1;
            }
            return value;
          });

          const placeholders = columnNames.map((_, index) => `$${index + 1}`).join(', ');
          const quotedColumns = columnNames.map(col => `"${col}"`).join(', ');
          
          const insertSQL = `INSERT INTO ${pgTableName} (${quotedColumns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
          
          await pgClient.query(insertSQL, values);
          insertedCount++;
        } catch (error) {
          console.log(`Error inserting row in ${tableName}:`, error.message);
        }
      }

      console.log(`✅ Inserted ${insertedCount} records into ${pgTableName}`);
      totalRecords += insertedCount;
    }

    // Add some default data if tables are empty
    console.log('\nAdding default data...');
    
    // Add admin user if no users exist
    const userCount = await pgClient.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) === 0) {
      await pgClient.query(`
        INSERT INTO users (id, email, name, password, role) 
        VALUES ('admin-user-id', 'admin@snpitc.in', 'Admin User', '$2b$10$hash', 'ADMIN')
      `);
      console.log('✅ Added default admin user');
    }

    // Add basic settings
    const settingsCount = await pgClient.query('SELECT COUNT(*) FROM settings');
    if (parseInt(settingsCount.rows[0].count) === 0) {
      await pgClient.query(`
        INSERT INTO settings (key, value, type) VALUES 
        ('site_name', 'S.N. Pvt. Industrial Training Institute', 'STRING'),
        ('site_description', 'Approved by Directorate of Technical Education', 'STRING'),
        ('contact_email', 'snitcsrdr@gmail.com', 'STRING')
      `);
      console.log('✅ Added default settings');
    }

    // Add navigation items
    const navCount = await pgClient.query('SELECT COUNT(*) FROM navigation_items');
    if (parseInt(navCount.rows[0].count) === 0) {
      await pgClient.query(`
        INSERT INTO navigation_items (id, title, href, "order", "isVisible", "linkType") VALUES 
        ('nav-home', 'Home', '/', 0, true, 'internal'),
        ('nav-about', 'About Us', '/about-us', 1, true, 'internal'),
        ('nav-contact', 'Contact', '/contact', 2, true, 'internal')
      `);
      console.log('✅ Added default navigation items');
    }

    console.log(`\n🎉 Migration completed successfully!`);
    console.log(`📊 Total records migrated: ${totalRecords}`);
    console.log(`🔗 Your DATABASE_URL: ${SUPABASE_URL.replace(/:[^:@]*@/, ':****@')}`);
    console.log(`\n📝 Next steps:`);
    console.log(`1. Update your .env.local with: DATABASE_URL="${SUPABASE_URL}"`);
    console.log(`2. Run: npx prisma generate`);
    console.log(`3. Run: npx prisma db push`);
    console.log(`4. Start your application: npm run dev`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    sqliteDb.close();
    await pgClient.end();
  }
}

// Check if running directly
if (require.main === module) {
  setupSupabaseDatabase()
    .then(() => {
      console.log('\n✅ Supabase setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupSupabaseDatabase };
