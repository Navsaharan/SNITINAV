const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');
const path = require('path');

const navjeetDbPath = path.join(__dirname, '..', 'navjeet.db');

// PostgreSQL connection configuration
const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'navjeet_db',
  password: 'password',
  port: 5432,
};

async function convertSqliteToPostgreSQL() {
  const sqliteDb = new sqlite3.Database(navjeetDbPath, sqlite3.OPEN_READONLY);
  const pgClient = new Client(pgConfig);

  try {
    console.log('Connecting to PostgreSQL...');
    await pgClient.connect();
    
    console.log('Creating database schema...');
    
    // Create tables in PostgreSQL
    const createTablesSQL = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'EDITOR',
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Pages table
      CREATE TABLE IF NOT EXISTS pages (
        id TEXT PRIMARY KEY,
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
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdById" TEXT NOT NULL,
        FOREIGN KEY ("createdById") REFERENCES users(id),
        FOREIGN KEY ("parentId") REFERENCES pages(id)
      );

      -- Contents table
      CREATE TABLE IF NOT EXISTS contents (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT,
        content TEXT,
        data TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "pageId" TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdById" TEXT NOT NULL,
        FOREIGN KEY ("pageId") REFERENCES pages(id) ON DELETE CASCADE,
        FOREIGN KEY ("createdById") REFERENCES users(id)
      );

      -- Media table
      CREATE TABLE IF NOT EXISTS media (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        "originalName" TEXT NOT NULL,
        "mimeType" TEXT NOT NULL,
        size INTEGER NOT NULL,
        url TEXT NOT NULL,
        alt TEXT,
        caption TEXT,
        category TEXT NOT NULL DEFAULT 'GENERAL',
        tags TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdById" TEXT NOT NULL,
        FOREIGN KEY ("createdById") REFERENCES users(id)
      );

      -- Settings table
      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'STRING',
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Menu items table
      CREATE TABLE IF NOT EXISTS menu_items (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        url TEXT,
        "pageId" TEXT,
        "parentId" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("parentId") REFERENCES menu_items(id)
      );

      -- Navigation items table
      CREATE TABLE IF NOT EXISTS navigation_items (
        id TEXT PRIMARY KEY,
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
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("parentId") REFERENCES navigation_items(id) ON DELETE CASCADE
      );

      -- Faculty table
      CREATE TABLE IF NOT EXISTS faculty (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        designation TEXT NOT NULL,
        department TEXT,
        email TEXT,
        phone TEXT,
        "photoUrl" TEXT,
        bio TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Contact messages table
      CREATE TABLE IF NOT EXISTS contact_messages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        contact TEXT,
        subject TEXT,
        message TEXT NOT NULL,
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Page views table
      CREATE TABLE IF NOT EXISTS page_views (
        id TEXT PRIMARY KEY,
        "pageSlug" TEXT NOT NULL,
        "userAgent" TEXT,
        "ipAddress" TEXT,
        referer TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_navigation_items_parent_id ON navigation_items("parentId");
      CREATE INDEX IF NOT EXISTS idx_navigation_items_order ON navigation_items("order");
      CREATE INDEX IF NOT EXISTS idx_navigation_items_is_visible ON navigation_items("isVisible");
    `;

    await pgClient.query(createTablesSQL);
    console.log('PostgreSQL schema created successfully');

    // Get all tables from SQLite
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

      // Get data from SQLite
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

      // Get column info
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

      // Insert data into PostgreSQL
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

      console.log(`Inserted ${insertedCount} records into ${pgTableName}`);
      totalRecords += insertedCount;
    }

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`Total records migrated: ${totalRecords}`);
    console.log(`PostgreSQL database connection string: postgresql://${pgConfig.user}:${pgConfig.password}@${pgConfig.host}:${pgConfig.port}/${pgConfig.database}`);

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    sqliteDb.close();
    await pgClient.end();
  }
}

// Run the conversion
convertSqliteToPostgreSQL()
  .then(() => {
    console.log('\nSQLite to PostgreSQL conversion completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Conversion failed:', error);
    process.exit(1);
  });
