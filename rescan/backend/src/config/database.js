/**
 * Database Configuration for Rescan Educational Project
 * ===================================================
 * 
 * Educational Focus: Learn database connection management, schema creation,
 * and data persistence with SQLite.
 * 
 * Key Learning Concepts:
 * - Database connections and connection pooling
 * - SQL schema definition and table relationships
 * - Error handling for database operations
 * - Environment-based configuration
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Educational Note: We store database configuration in environment variables
// This allows different settings for development vs production
const config = {
  database: {
    // SQLite database file path from environment or default
    filename: process.env.DATABASE_URL?.replace('sqlite:', '') || './data/rescan.db',
    
    // SQLite connection options for educational debugging
    options: {
      // Verbose mode helps students see SQL operations in console
      verbose: process.env.EDUCATIONAL_MODE === 'true' ? console.log : null,
      
      // Enable foreign key constraints for referential integrity learning
      foreignKeys: true,
    }
  },
  
  // Educational settings for classroom environment
  pool: {
    // Max concurrent connections (SQLite handles this automatically)
    max: 1,
    
    // Connection timeout for educational feedback
    acquireTimeoutMillis: 30000,
  }
};

/**
 * Educational Function: Create database connection
 * 
 * This function demonstrates:
 * - Promise-based database connections
 * - Error handling patterns
 * - Database file creation and directory management
 * 
 * @returns {Promise<sqlite3.Database>} Connected database instance
 */
function createConnection() {
  return new Promise((resolve, reject) => {
    // Educational Note: Ensure data directory exists
    const dbPath = path.resolve(config.database.filename);
    const dataDir = path.dirname(dbPath);
    
    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      console.log('📁 Creating data directory for SQLite database...');
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    console.log(`🗃️ Connecting to SQLite database at: ${dbPath}`);
    
    // Create SQLite database connection
    const db = new sqlite3.Database(
      dbPath,
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (err) => {
        if (err) {
          console.error('❌ Database connection error:', err.message);
          reject(new Error(`Failed to connect to database: ${err.message}`));
          return;
        }
        
        console.log('✅ Connected to SQLite database successfully');
        
        // Educational Note: Enable foreign key constraints
        // SQLite requires this to be enabled per connection
        db.run('PRAGMA foreign_keys = ON', (fkErr) => {
          if (fkErr) {
            console.warn('⚠️ Could not enable foreign keys:', fkErr.message);
          } else if (config.database.options.verbose) {
            console.log('🔗 Foreign key constraints enabled');
          }
        });
        
        resolve(db);
      }
    );
    
    // Educational Note: Handle database errors for learning
    db.on('error', (err) => {
      console.error('💥 Database error:', err.message);
    });
    
    // Educational Note: Log when database is closed
    db.on('close', () => {
      if (config.database.options.verbose) {
        console.log('📴 Database connection closed');
      }
    });
  });
}

/**
 * Educational Function: Close database connection gracefully
 * 
 * Demonstrates proper resource cleanup patterns
 * 
 * @param {sqlite3.Database} db - Database connection to close
 * @returns {Promise<void>}
 */
function closeConnection(db) {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve();
      return;
    }
    
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
        reject(err);
        return;
      }
      
      console.log('✅ Database connection closed successfully');
      resolve();
    });
  });
}

/**
 * Educational Function: Test database connection
 * 
 * Useful for debugging and verifying setup
 * Students can call this to check if their database is working
 * 
 * @returns {Promise<boolean>} True if connection successful
 */
async function testConnection() {
  try {
    console.log('🧪 Testing database connection...');
    const db = await createConnection();
    
    // Simple test query
    const testResult = await new Promise((resolve, reject) => {
      db.get('SELECT 1 as test', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    await closeConnection(db);
    
    if (testResult && testResult.test === 1) {
      console.log('✅ Database connection test passed!');
      return true;
    } else {
      console.error('❌ Database connection test failed: unexpected result');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    return false;
  }
}

// Educational Export: Make configuration and functions available
module.exports = {
  config,
  createConnection,
  closeConnection,
  testConnection,
  
  // Educational helper: Get database file path for debugging
  getDatabasePath: () => path.resolve(config.database.filename),
};

// Educational Note: If this file is run directly, test the connection
if (require.main === module) {
  console.log('🎓 Database Configuration Test Mode');
  testConnection()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}