const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const navjeetDbPath = path.join(__dirname, '..', 'navjeet.db');

function checkNavjeetData() {
  return new Promise((resolve, reject) => {
    console.log('Checking navjeet.db contents...');
    
    const db = new sqlite3.Database(navjeetDbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error('Error opening navjeet.db:', err.message);
        reject(err);
        return;
      }
      console.log('Connected to navjeet.db');
    });

    // Get all table names
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", [], (err, tables) => {
      if (err) {
        console.error('Error getting tables:', err.message);
        reject(err);
        return;
      }

      console.log(`\nFound ${tables.length} tables in navjeet.db:`);
      
      if (tables.length === 0) {
        console.log('No tables found in navjeet.db');
        db.close();
        resolve();
        return;
      }

      let processedTables = 0;

      tables.forEach(table => {
        const tableName = table.name;
        
        // Get row count for each table
        db.get(`SELECT COUNT(*) as count FROM ${tableName}`, [], (err, result) => {
          if (err) {
            console.error(`Error counting rows in ${tableName}:`, err.message);
          } else {
            console.log(`- ${tableName}: ${result.count} records`);
            
            // Show sample data for tables with records
            if (result.count > 0) {
              db.all(`SELECT * FROM ${tableName} LIMIT 3`, [], (err, rows) => {
                if (err) {
                  console.error(`Error getting sample data from ${tableName}:`, err.message);
                } else if (rows.length > 0) {
                  console.log(`  Sample data from ${tableName}:`);
                  console.log(`  Columns: ${Object.keys(rows[0]).join(', ')}`);
                  rows.forEach((row, index) => {
                    console.log(`  Row ${index + 1}:`, JSON.stringify(row, null, 2));
                  });
                }
                
                processedTables++;
                if (processedTables === tables.length) {
                  db.close();
                  resolve();
                }
              });
            } else {
              processedTables++;
              if (processedTables === tables.length) {
                db.close();
                resolve();
              }
            }
          }
        });
      });
    });
  });
}

// Run the check
checkNavjeetData()
  .then(() => {
    console.log('\nNavjeet.db analysis completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Analysis failed:', error);
    process.exit(1);
  });
