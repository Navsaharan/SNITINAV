const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database paths
const navjeetDbPath = path.join(__dirname, '..', 'navjeet.db');
const devDbPath = path.join(__dirname, '..', 'prisma', 'dev.db');

async function mergeData() {
  return new Promise((resolve, reject) => {
    console.log('Starting data merge from navjeet.db to dev.db...');
    
    // Open both databases
    const navjeetDb = new sqlite3.Database(navjeetDbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error('Error opening navjeet.db:', err.message);
        reject(err);
        return;
      }
      console.log('Connected to navjeet.db');
    });

    const devDb = new sqlite3.Database(devDbPath, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.error('Error opening dev.db:', err.message);
        reject(err);
        return;
      }
      console.log('Connected to dev.db');
    });

    // Get all table names from navjeet.db
    navjeetDb.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", [], (err, tables) => {
      if (err) {
        console.error('Error getting tables:', err.message);
        reject(err);
        return;
      }

      console.log(`Found ${tables.length} tables in navjeet.db:`, tables.map(t => t.name));

      let processedTables = 0;
      let totalRecordsCopied = 0;

      if (tables.length === 0) {
        console.log('No tables found in navjeet.db');
        navjeetDb.close();
        devDb.close();
        resolve(totalRecordsCopied);
        return;
      }

      tables.forEach(table => {
        const tableName = table.name;
        console.log(`\nProcessing table: ${tableName}`);

        // First, check if table exists in dev.db
        devDb.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`, [], (err, devTable) => {
          if (err) {
            console.error(`Error checking table ${tableName} in dev.db:`, err.message);
            processedTables++;
            if (processedTables === tables.length) {
              navjeetDb.close();
              devDb.close();
              resolve(totalRecordsCopied);
            }
            return;
          }

          if (!devTable) {
            console.log(`Table ${tableName} does not exist in dev.db, skipping...`);
            processedTables++;
            if (processedTables === tables.length) {
              navjeetDb.close();
              devDb.close();
              resolve(totalRecordsCopied);
            }
            return;
          }

          // Get all data from navjeet.db table
          navjeetDb.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
            if (err) {
              console.error(`Error reading from ${tableName}:`, err.message);
              processedTables++;
              if (processedTables === tables.length) {
                navjeetDb.close();
                devDb.close();
                resolve(totalRecordsCopied);
              }
              return;
            }

            if (rows.length === 0) {
              console.log(`No data in ${tableName}`);
              processedTables++;
              if (processedTables === tables.length) {
                navjeetDb.close();
                devDb.close();
                resolve(totalRecordsCopied);
              }
              return;
            }

            console.log(`Found ${rows.length} records in ${tableName}`);

            // Get column info to build INSERT statement
            navjeetDb.all(`PRAGMA table_info(${tableName})`, [], (err, columns) => {
              if (err) {
                console.error(`Error getting column info for ${tableName}:`, err.message);
                processedTables++;
                if (processedTables === tables.length) {
                  navjeetDb.close();
                  devDb.close();
                  resolve(totalRecordsCopied);
                }
                return;
              }

              const columnNames = columns.map(col => col.name);
              const placeholders = columnNames.map(() => '?').join(', ');
              const insertSql = `INSERT OR IGNORE INTO ${tableName} (${columnNames.join(', ')}) VALUES (${placeholders})`;

              let insertedCount = 0;
              let processedRows = 0;

              rows.forEach(row => {
                const values = columnNames.map(col => row[col]);
                
                devDb.run(insertSql, values, function(err) {
                  if (err) {
                    console.error(`Error inserting into ${tableName}:`, err.message);
                  } else if (this.changes > 0) {
                    insertedCount++;
                  }
                  
                  processedRows++;
                  
                  if (processedRows === rows.length) {
                    console.log(`Inserted ${insertedCount} new records into ${tableName} (${rows.length - insertedCount} duplicates skipped)`);
                    totalRecordsCopied += insertedCount;
                    processedTables++;
                    
                    if (processedTables === tables.length) {
                      navjeetDb.close();
                      devDb.close();
                      resolve(totalRecordsCopied);
                    }
                  }
                });
              });
            });
          });
        });
      });
    });
  });
}

// Run the merge
mergeData()
  .then((totalCopied) => {
    console.log(`\nData merge completed successfully!`);
    console.log(`Total new records copied: ${totalCopied}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Data merge failed:', error);
    process.exit(1);
  });
