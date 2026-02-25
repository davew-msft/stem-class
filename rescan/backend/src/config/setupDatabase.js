/**
 * Database Setup Script for Rescan Educational Project
 * 
 * This script initializes the SQLite database with required tables
 * Educational Focus: Database schema creation and initialization
 */

const dbService = require('../services/dbService');
const fs = require('fs').promises;
const path = require('path');

async function setupDatabase() {
    console.log('🗄️ Starting database setup...');
    
    try {
        // Educational Note: Ensure data directory exists
        const dataDir = path.join(__dirname, '../../../data');
        await fs.mkdir(dataDir, { recursive: true });
        console.log('📁 Data directory prepared');
        
        // Educational Note: Initialize database service
        await dbService.initialize();
        console.log('✅ Database service initialized');
        
        // Educational Note: Create tables
        await createTables(dbService);
        
        // Educational Note: Create sample data for testing
        await createSampleData(dbService);
        
        console.log('🎉 Database setup completed successfully!');
        console.log('📊 Ready to run: npm run dev');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    }
}

/**
 * Create all required database tables
 */
async function createTables(dbService) {
    console.log('🔨 Creating database tables...');
    
    // Educational Note: Addresses table for tracking recycling points
    const createAddressesTable = `
        CREATE TABLE IF NOT EXISTS addresses (
            street_address VARCHAR(255) PRIMARY KEY,
            points_total INTEGER DEFAULT 0 NOT NULL CHECK (points_total >= 0),
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT chk_address_not_empty CHECK (length(trim(street_address)) > 0),
            CONSTRAINT chk_address_length CHECK (length(street_address) <= 255)
        )
    `;
    
    // Educational Note: Scan sessions table for AI analysis tracking
    const createScanSessionsTable = `
        CREATE TABLE IF NOT EXISTS scan_sessions (
            id TEXT PRIMARY KEY,
            address_id TEXT,
            file_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            file_mime_type TEXT NOT NULL,
            material_type TEXT,
            ric_code INTEGER,
            confidence INTEGER DEFAULT 0,
            ai_analysis TEXT,
            points_earned INTEGER DEFAULT 0,
            is_recyclable INTEGER DEFAULT 0,
            description TEXT,
            user_feedback TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (address_id) REFERENCES addresses (id)
        )
    `;
    
    // Educational Note: Execute table creation commands
    await new Promise((resolve, reject) => {
        dbService.db.exec(createAddressesTable, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
    console.log('✅ Addresses table created');
    
    await new Promise((resolve, reject) => {
        dbService.db.exec(createScanSessionsTable, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
    console.log('✅ Scan sessions table created');
    
    // Educational Note: Create indexes for better performance
    const createIndexes = `
        CREATE INDEX IF NOT EXISTS idx_addresses_street ON addresses(street_address);
        CREATE INDEX IF NOT EXISTS idx_scan_sessions_address ON scan_sessions(address_id);
        CREATE INDEX IF NOT EXISTS idx_scan_sessions_created ON scan_sessions(created_at);
    `;
    
    await new Promise((resolve, reject) => {
        dbService.db.exec(createIndexes, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
    console.log('✅ Database indexes created');
}

/**
 * Create sample data for educational testing
 */
async function createSampleData(dbService) {
    console.log('📝 Creating sample data for testing...');
    
    // Educational Note: Sample NJ addresses for testing
    const sampleAddresses = [
        {
            street_address: '123 Main Street, Newark, NJ',
            points_total: 150
        },
        {
            street_address: '456 Oak Avenue, Trenton, New Jersey',
            points_total: 85
        }
    ];
    
    // Educational Note: Insert sample addresses
    for (const address of sampleAddresses) {
        try {
            await new Promise((resolve, reject) => {
                dbService.db.run(
                    `INSERT OR IGNORE INTO addresses 
                     (street_address, points_total, is_active, created_at, updated_at) 
                     VALUES (?, ?, 1, datetime('now'), datetime('now'))`,
                    [
                        address.street_address,
                        address.points_total
                    ],
                    function(err) {
                        if (err) reject(err);
                        else resolve(this);
                    }
                );
            });
            
            console.log(`📍 Sample address added: ${address.street_address} (${address.points_total} points)`);
        } catch (error) {
            console.warn(`⚠️ Could not add sample address: ${address.street_address}`, error.message);
        }
    }
    
    console.log('✅ Sample data creation completed');
}

// Educational Note: Run the setup if this file is executed directly
if (require.main === module) {
    setupDatabase();
}

module.exports = { setupDatabase, createTables, createSampleData };