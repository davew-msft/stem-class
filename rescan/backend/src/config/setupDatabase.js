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
            id TEXT PRIMARY KEY,
            street_address TEXT UNIQUE NOT NULL,
            latitude REAL,
            longitude REAL,
            total_points INTEGER DEFAULT 0,
            scan_count INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
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
    await dbService.db.exec(createAddressesTable);
    console.log('✅ Addresses table created');
    
    await dbService.db.exec(createScanSessionsTable);
    console.log('✅ Scan sessions table created');
    
    // Educational Note: Create indexes for better performance
    const createIndexes = `
        CREATE INDEX IF NOT EXISTS idx_addresses_street ON addresses(street_address);
        CREATE INDEX IF NOT EXISTS idx_scan_sessions_address ON scan_sessions(address_id);
        CREATE INDEX IF NOT EXISTS idx_scan_sessions_created ON scan_sessions(created_at);
    `;
    
    await dbService.db.exec(createIndexes);
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
            id: 'addr-sample-123',
            street_address: '123 Main Street, Newark, NJ',
            latitude: 40.7357,
            longitude: -74.1724,
            total_points: 150,
            scan_count: 3,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'addr-sample-456',
            street_address: '456 Oak Avenue, Trenton, New Jersey',
            latitude: 40.2206,
            longitude: -74.7563,
            total_points: 85,
            scan_count: 2,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ];
    
    // Educational Note: Insert sample addresses
    for (const address of sampleAddresses) {
        try {
            await dbService.db.run(
                `INSERT OR IGNORE INTO addresses 
                 (id, street_address, latitude, longitude, total_points, scan_count, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    address.id,
                    address.street_address,
                    address.latitude,
                    address.longitude,
                    address.total_points,
                    address.scan_count,
                    address.created_at,
                    address.updated_at
                ]
            );
            
            console.log(`📍 Sample address added: ${address.street_address} (${address.total_points} points)`);
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