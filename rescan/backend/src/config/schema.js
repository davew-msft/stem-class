/**
 * Database Schema Initialization for Rescan Educational Project
 * ===========================================================
 * 
 * Educational Focus: Learn database schema design, SQLite syntax,
 * data modeling, and database migration patterns.
 * 
 * Key Learning Concepts:
 * - SQL Data Definition Language (DDL)
 * - Primary and foreign key relationships
 * - Index optimization for queries
 * - Data types and constraints
 * - Database initialization patterns
 * - Schema versioning and migrations
 */

const path = require('path');
const fs = require('fs');
const { createConnection, closeConnection } = require('./database');

/**
 * Educational Function: Create Users Table
 * 
 * Demonstrates user management table design with educational tracking
 * Learn about: user profiles, timestamps, unique constraints
 */
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    -- Educational Note: Primary key with auto-increment
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Educational Note: User identification and profile
    username VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    
    -- Educational Note: Points and gamification system
    points INTEGER DEFAULT 0 NOT NULL CHECK (points >= 0),
    level INTEGER DEFAULT 1 NOT NULL CHECK (level >= 1),
    scans_count INTEGER DEFAULT 0 NOT NULL CHECK (scans_count >= 0),
    
    -- Educational Note: User preferences
    preferred_language VARCHAR(10) DEFAULT 'en',
    notification_preferences TEXT, -- JSON string for flexibility
    
    -- Educational Note: Educational progress tracking
    educational_level VARCHAR(50) DEFAULT 'beginner', -- beginner, intermediate, advanced
    completed_tutorials TEXT, -- JSON array of completed tutorial IDs
    achievement_badges TEXT, -- JSON array of earned badges
    
    -- Educational Note: Timestamps for user tracking
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    
    -- Educational Note: Account status and metadata
    is_active BOOLEAN DEFAULT 1,
    profile_picture_url VARCHAR(500),
    
    -- Educational Note: Constraints for data integrity
    CONSTRAINT chk_username_length CHECK (length(username) >= 3),
    CONSTRAINT chk_display_name_length CHECK (length(display_name) >= 1),
    CONSTRAINT chk_valid_language CHECK (preferred_language IN ('en', 'es', 'fr', 'de')),
    CONSTRAINT chk_valid_edu_level CHECK (educational_level IN ('beginner', 'intermediate', 'advanced'))
  )
`;

/**
 * Educational Function: Create Materials Table
 * 
 * Demonstrates reference data table for recycling materials
 * Learn about: reference tables, enumerated values, text search
 */
const createMaterialsTable = `
  CREATE TABLE IF NOT EXISTS materials (
    -- Educational Note: Primary key for material types
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Educational Note: Material identification
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    
    -- Educational Note: Recycling information
    recycling_symbol_number INTEGER,
    recycling_symbol_code VARCHAR(10),
    is_recyclable BOOLEAN NOT NULL DEFAULT 1,
    
    -- Educational Note: Educational content
    description TEXT,
    recycling_process TEXT,
    environmental_impact TEXT,
    fun_facts TEXT, -- JSON array of educational facts
    
    -- Educational Note: Points and difficulty for gamification
    scan_points INTEGER DEFAULT 10 NOT NULL CHECK (scan_points > 0),
    difficulty_level VARCHAR(20) DEFAULT 'easy', -- easy, medium, hard, expert
    
    -- Educational Note: Visual identification
    common_examples TEXT, -- JSON array of common items
    color_variations TEXT, -- JSON array of typical colors
    texture_description TEXT,
    
    -- Educational Note: Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1,
    
    -- Educational Note: Data validation constraints
    CONSTRAINT chk_category_valid CHECK (category IN (
      'plastic', 'paper', 'metal', 'glass', 'fabric', 
      'electronic', 'battery', 'organic', 'hazardous', 'other'
    )),
    CONSTRAINT chk_symbol_number_range CHECK (
      recycling_symbol_number IS NULL OR 
      (recycling_symbol_number >= 1 AND recycling_symbol_number <= 7)
    ),
    CONSTRAINT chk_difficulty_valid CHECK (difficulty_level IN (
      'easy', 'medium', 'hard', 'expert'
    ))
  )
`;

/**
 * Educational Function: Create Locations Table
 * 
 * Demonstrates geographic data storage for recycling centers
 * Learn about: location data, spatial queries (basic), address normalization
 */
const createLocationsTable = `
  CREATE TABLE IF NOT EXISTS locations (
    -- Educational Note: Primary key for recycling locations
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Educational Note: Location identification
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL, -- recycling_center, drop_off_point, collection_site
    
    -- Educational Note: Address information
    street_address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    
    -- Educational Note: Geographic coordinates for mapping
    latitude DECIMAL(10, 8),  -- High precision for mapping
    longitude DECIMAL(11, 8),
    
    -- Educational Note: Contact and operational information
    phone VARCHAR(20),
    email VARCHAR(255),
    website_url VARCHAR(500),
    hours_of_operation TEXT, -- JSON object with days/hours
    
    -- Educational Note: Accepted materials (many-to-many relationship)
    accepted_materials TEXT, -- JSON array of material IDs or categories
    
    -- Educational Note: Additional services and features
    services_offered TEXT, -- JSON array: pickup, dropoff, sorting, education
    accessibility_features TEXT, -- JSON array of accessibility options
    special_notes TEXT,
    
    -- Educational Note: Operational status
    is_active BOOLEAN DEFAULT 1,
    is_verified BOOLEAN DEFAULT 0, -- Has location been verified by admin
    verification_date DATETIME,
    
    -- Educational Note: Metadata tracking
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_verified DATETIME,
    
    -- Educational Note: Data quality constraints
    CONSTRAINT chk_location_type CHECK (type IN (
      'recycling_center', 'drop_off_point', 'collection_site', 
      'curbside_pickup', 'special_event'
    )),
    CONSTRAINT chk_valid_coordinates CHECK (
      (latitude IS NULL AND longitude IS NULL) OR
      (latitude IS NOT NULL AND longitude IS NOT NULL AND 
       latitude BETWEEN -90 AND 90 AND 
       longitude BETWEEN -180 AND 180)
    )
  )
`;

/**
 * Educational Function: Create Scans Table
 * 
 * Demonstrates transaction/activity logging table
 * Learn about: audit trails, foreign keys, JSON data storage
 */
const createScansTable = `
  CREATE TABLE IF NOT EXISTS scans (
    -- Educational Note: Primary key for scan records
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Educational Note: Foreign key relationships
    user_id INTEGER NOT NULL,
    material_id INTEGER, -- NULL if not identified or manual entry
    
    -- Educational Note: Scan method and source
    scan_method VARCHAR(20) NOT NULL, -- camera, manual, ai_analysis
    scan_source VARCHAR(50), -- mobile_camera, web_upload, manual_entry
    
    -- Educational Note: Image and analysis data
    image_url VARCHAR(500), -- Path to uploaded image
    image_analysis_result TEXT, -- JSON with AI analysis details
    confidence_score DECIMAL(5,4), -- 0.0000 to 1.0000 for AI confidence
    
    -- Educational Note: User input and correction
    user_correction TEXT, -- JSON with user corrections to AI analysis
    manual_material_name VARCHAR(200), -- If user manually identified
    user_feedback VARCHAR(20), -- correct, incorrect, partially_correct
    
    -- Educational Note: Educational context
    learning_objective VARCHAR(100), -- What the user was trying to learn
    difficulty_encountered VARCHAR(20), -- none, easy, medium, hard
    help_used BOOLEAN DEFAULT 0, -- Did user use help features
    
    -- Educational Note: Points and gamification
    points_awarded INTEGER DEFAULT 0 CHECK (points_awarded >= 0),
    bonus_points INTEGER DEFAULT 0 CHECK (bonus_points >= 0),
    achievement_unlocked VARCHAR(100), -- Badge or achievement earned
    
    -- Educational Note: Location and context
    location_context VARCHAR(100), -- home, school, outdoors, public
    scan_location_lat DECIMAL(10, 8), -- Where scan was performed
    scan_location_lng DECIMAL(11, 8),
    
    -- Educational Note: Timing and metadata
    scan_duration_ms INTEGER, -- How long scan took (performance metric)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Educational Note: Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE SET NULL,
    
    -- Educational Note: Data validation
    CONSTRAINT chk_scan_method CHECK (scan_method IN (
      'camera', 'manual', 'ai_analysis'
    )),
    CONSTRAINT chk_confidence_range CHECK (
      confidence_score IS NULL OR 
      (confidence_score >= 0.0 AND confidence_score <= 1.0)
    ),
    CONSTRAINT chk_feedback_valid CHECK (
      user_feedback IS NULL OR user_feedback IN (
        'correct', 'incorrect', 'partially_correct', 'unsure'
      )
    )
  )
`;

/**
 * Educational Function: Create User Progress Table
 * 
 * Demonstrates detailed educational tracking
 * Learn about: progress tracking, competency modeling, learning analytics
 */
const createUserProgressTable = `
  CREATE TABLE IF NOT EXISTS user_progress (
    -- Educational Note: Primary key for progress tracking
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Educational Note: User and subject relationship
    user_id INTEGER NOT NULL,
    topic VARCHAR(100) NOT NULL, -- recycling_symbols, material_types, environmental_impact
    
    -- Educational Note: Competency and skill levels
    current_level INTEGER DEFAULT 1 CHECK (current_level >= 1),
    experience_points INTEGER DEFAULT 0 CHECK (experience_points >= 0),
    mastery_percentage DECIMAL(5,2) DEFAULT 0.00 CHECK (
      mastery_percentage >= 0.00 AND mastery_percentage <= 100.00
    ),
    
    -- Educational Note: Learning activity tracking
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    scans_completed INTEGER DEFAULT 0,
    tutorials_completed INTEGER DEFAULT 0,
    
    -- Educational Note: Time-based learning metrics
    total_study_time_minutes INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0, -- Consecutive days of activity
    last_activity_date DATE,
    
    -- Educational Note: Personalized learning data
    preferred_learning_style VARCHAR(50), -- visual, auditory, kinesthetic, mixed
    common_mistakes TEXT, -- JSON array of frequently made errors
    strength_areas TEXT, -- JSON array of topics user excels at
    improvement_areas TEXT, -- JSON array of topics needing work
    
    -- Educational Note: Goal tracking
    current_goal VARCHAR(200),
    goal_deadline DATE,
    goal_progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Educational Note: Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Educational Note: Constraints and relationships
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Educational Note: Ensure unique topic per user
    UNIQUE(user_id, topic),
    
    -- Educational Note: Data validation
    CONSTRAINT chk_valid_topic CHECK (topic IN (
      'recycling_symbols', 'material_types', 'environmental_impact',
      'sorting_techniques', 'local_programs', 'waste_reduction'
    )),
    CONSTRAINT chk_consistent_questions CHECK (
      questions_correct <= questions_attempted
    )
  )
`;

/**
 * Educational Function: Create Addresses Table
 * 
 * Demonstrates simplified address-based recycling tracking table
 * Learn about: natural primary keys, business logic implementation
 */
const createAddressesTable = `
  CREATE TABLE IF NOT EXISTS addresses (
    -- Educational Note: Natural primary key using street address
    street_address VARCHAR(255) PRIMARY KEY,
    
    -- Educational Note: Cumulative recycling points for gamification
    points_total INTEGER DEFAULT 0 NOT NULL CHECK (points_total >= 0),
    
    -- Educational Note: Timestamps for tracking and analytics
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Educational Note: Data validation constraints
    CONSTRAINT chk_address_not_empty CHECK (length(trim(street_address)) > 0),
    CONSTRAINT chk_address_length CHECK (length(street_address) <= 255)
  )
`;

/**
 * Educational Function: Create ScanSessions Table
 * 
 * Demonstrates audit trail and activity logging for recycling scans
 * Learn about: foreign keys, referential integrity, activity tracking
 */
const createScanSessionsTable = `
  CREATE TABLE IF NOT EXISTS scan_sessions (
    -- Educational Note: UUID primary key for unique session identification
    session_id VARCHAR(36) PRIMARY KEY,
    
    -- Educational Note: Foreign key to addresses table
    address VARCHAR(255) NOT NULL,
    
    -- Educational Note: AI-identified material information
    material_type VARCHAR(50) NOT NULL,
    is_recyclable BOOLEAN NOT NULL,
    
    -- Educational Note: Points awarded for gamification
    points_awarded INTEGER CHECK (points_awarded IN (0, 10, 100)),
    
    -- Educational Note: Scan timing and audit trail
    scan_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Educational Note: Full AI response for educational review and debugging
    image_analysis_result TEXT,
    
    -- Educational Note: Foreign key constraint to ensure referential integrity
    FOREIGN KEY (address) REFERENCES addresses(street_address) ON DELETE CASCADE,
    
    -- Educational Note: Data validation constraints
    CONSTRAINT chk_material_type_format CHECK (length(material_type) > 0),
    CONSTRAINT chk_session_id_format CHECK (length(session_id) = 36)
  )
`;

/**
 * Educational Function: Create Database Indexes
 * 
 * Demonstrates query optimization through indexing
 * Learn about: database performance, query optimization, index selection
 */
const createIndexes = [
  // Educational Note: Index for user lookups by username
  `CREATE INDEX IF NOT EXISTS idx_users_username 
   ON users(username)`,
   
  // Educational Note: Index for user email lookups
  `CREATE INDEX IF NOT EXISTS idx_users_email 
   ON users(email)`,
   
  // Educational Note: Index for material category searches
  `CREATE INDEX IF NOT EXISTS idx_materials_category 
   ON materials(category)`,
   
  // Educational Note: Index for recyclable material lookups
  `CREATE INDEX IF NOT EXISTS idx_materials_recyclable 
   ON materials(is_recyclable)`,
   
  // Educational Note: Index for location searches by city/state
  `CREATE INDEX IF NOT EXISTS idx_locations_city_state 
   ON locations(city, state)`,
   
  // Educational Note: Index for active location lookups
  `CREATE INDEX IF NOT EXISTS idx_locations_active 
   ON locations(is_active)`,
   
  // Educational Note: Index for user scan history
  `CREATE INDEX IF NOT EXISTS idx_scans_user_date 
   ON scans(user_id, created_at DESC)`,
   
  // Educational Note: Index for material scan lookups
  `CREATE INDEX IF NOT EXISTS idx_scans_material 
   ON scans(material_id)`,
   
  // Educational Note: Index for user progress tracking
  `CREATE INDEX IF NOT EXISTS idx_progress_user_topic 
   ON user_progress(user_id, topic)`,
   
  // Educational Note: Composite index for recent activity
  `CREATE INDEX IF NOT EXISTS idx_scans_recent 
   ON scans(created_at DESC, user_id)`
];

/**
 * Educational Function: Insert Sample Data
 * 
 * Demonstrates data seeding for educational examples
 * Learn about: sample data creation, INSERT statements, data consistency
 */
const insertSampleData = [
  // Educational Note: Sample materials for learning
  `INSERT OR IGNORE INTO materials (
    name, category, recycling_symbol_number, recycling_symbol_code,
    is_recyclable, description, scan_points, difficulty_level,
    common_examples, created_at
  ) VALUES 
  ('PET Plastic', 'plastic', 1, 'PETE',
   1, 'Polyethylene Terephthalate - commonly used for water bottles and food containers',
   10, 'easy',
   '["water bottles", "soda bottles", "food containers"]',
   CURRENT_TIMESTAMP),
   
  ('HDPE Plastic', 'plastic', 2, 'HDPE', 
   1, 'High-Density Polyethylene - used for milk jugs and detergent bottles',
   15, 'easy',
   '["milk jugs", "detergent bottles", "yogurt containers"]',
   CURRENT_TIMESTAMP),
   
  ('Aluminum Can', 'metal', NULL, 'ALU',
   1, 'Aluminum cans are infinitely recyclable and save significant energy when recycled',
   20, 'easy',
   '["soda cans", "beer cans", "energy drink cans"]',
   CURRENT_TIMESTAMP),
   
  ('Cardboard', 'paper', NULL, 'PAP',
   1, 'Corrugated cardboard boxes are highly recyclable when clean and dry',
   15, 'medium',
   '["shipping boxes", "cereal boxes", "pizza boxes (if clean)"]',
   CURRENT_TIMESTAMP),
   
  ('Glass Bottle', 'glass', NULL, 'GL',
   1, 'Glass can be recycled indefinitely without quality loss',
   25, 'medium',
   '["wine bottles", "beer bottles", "juice bottles"]',
   CURRENT_TIMESTAMP)`,
   
  // Educational Note: Sample locations for testing
  `INSERT OR IGNORE INTO locations (
    name, type, street_address, city, state, zip_code,
    phone, hours_of_operation, accepted_materials, is_active, created_at
  ) VALUES 
  ('Downtown Recycling Center', 'recycling_center',
   '123 Green St', 'Educational City', 'Learning State', '12345',
   '(555) 123-4567',
   '{"mon-fri": "8:00-17:00", "sat": "9:00-15:00", "sun": "closed"}',
   '["plastic", "metal", "paper", "glass"]',
   1, CURRENT_TIMESTAMP),
   
  ('School District Drop-Off', 'drop_off_point',
   '456 Education Ave', 'Educational City', 'Learning State', '12345',
   '(555) 234-5678',
   '{"mon-sun": "24/7"}',
   '["plastic", "paper", "batteries"]',
   1, CURRENT_TIMESTAMP)`,
   
  // Educational Note: Sample user for testing (optional)
  `INSERT OR IGNORE INTO users (
    username, display_name, email, points, level,
    educational_level, preferred_language, is_active, created_at
  ) VALUES 
  ('stem_student', 'STEM Learning Student', 'student@educational.demo',
   100, 2, 'beginner', 'en', 1, CURRENT_TIMESTAMP)`,
   
  // Educational Note: Sample addresses for US1 testing
  `INSERT OR IGNORE INTO addresses (
    street_address, points_total, is_active, created_at
  ) VALUES 
  ('123 Oak Street', 0, 1, CURRENT_TIMESTAMP),
  ('456 Maple Avenue', 25, 1, CURRENT_TIMESTAMP),
  ('789 Pine Road', 50, 1, CURRENT_TIMESTAMP),
  ('321 Elm Drive', 100, 1, CURRENT_TIMESTAMP),
  ('654 Cedar Court', 75, 1, CURRENT_TIMESTAMP)`
];

/**
 * Educational Function: Initialize Database Schema
 * 
 * Main function that creates all tables and indexes
 * Demonstrates transaction management and error handling
 * 
 * @returns {Promise<boolean>} True if successful
 */
async function initializeSchema() {
  let db = null;
  
  try {
    console.log('🗃️ Initializing SQLite database schema...');
    
    // Educational Note: Create database connection
    db = await createConnection();
    
    // Educational Note: Enable foreign key constraints
    await new Promise((resolve, reject) => {
      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Foreign key constraints enabled');
    
    // Educational Note: Create tables in dependency order
    const tables = [
      { name: 'addresses', sql: createAddressesTable },
      { name: 'users', sql: createUsersTable },
      { name: 'materials', sql: createMaterialsTable },
      { name: 'locations', sql: createLocationsTable },
      { name: 'scans', sql: createScansTable },
      { name: 'scan_sessions', sql: createScanSessionsTable },
      { name: 'user_progress', sql: createUserProgressTable }
    ];
    
    for (const table of tables) {
      console.log(`📋 Creating table: ${table.name}`);
      await new Promise((resolve, reject) => {
        db.run(table.sql, (err) => {
          if (err) {
            console.error(`❌ Failed to create table ${table.name}:`, err.message);
            reject(err);
          } else {
            console.log(`✅ Table ${table.name} created successfully`);
            resolve();
          }
        });
      });
    }
    
    // Educational Note: Create indexes for query optimization
    console.log('📊 Creating database indexes...');
    for (let i = 0; i < createIndexes.length; i++) {
      const indexSql = createIndexes[i];
      await new Promise((resolve, reject) => {
        db.run(indexSql, (err) => {
          if (err) {
            console.error(`❌ Failed to create index ${i + 1}:`, err.message);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
    console.log('✅ All indexes created successfully');
    
    // Educational Note: Insert sample data for learning
    console.log('📝 Inserting educational sample data...');
    for (let i = 0; i < insertSampleData.length; i++) {
      const insertSql = insertSampleData[i];
      await new Promise((resolve, reject) => {
        db.run(insertSql, (err) => {
          if (err) {
            console.error(`❌ Failed to insert sample data ${i + 1}:`, err.message);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
    console.log('✅ Sample data inserted successfully');
    
    // Educational Note: Verify schema creation
    const tableCount = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'", (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    
    console.log(`📊 Schema initialization complete! Created ${tableCount} tables.`);
    console.log('🎓 Educational Note: Your database is ready for learning!');
    console.log('💡 Tip: Use a SQLite browser tool to explore the schema visually');
    
    return true;
    
  } catch (error) {
    console.error('💥 Schema initialization failed:', error.message);
    throw error;
    
  } finally {
    // Educational Note: Always close database connection
    if (db) {
      await closeConnection(db);
    }
  }
}

/**
 * Educational Function: Reset Database Schema
 * 
 * WARNING: This deletes all data - only for development/testing!
 * 
 * @returns {Promise<boolean>} True if successful
 */
async function resetSchema() {
  console.log('⚠️ WARNING: This will delete all data!');
  
  let db = null;
  
  try {
    db = await createConnection();
    
    // Educational Note: Drop tables in reverse dependency order  
    const dropTables = [
      'user_progress',
      'scans', 
      'locations',
      'materials',
      'users'
    ];
    
    for (const tableName of dropTables) {
      await new Promise((resolve, reject) => {
        db.run(`DROP TABLE IF EXISTS ${tableName}`, (err) => {
          if (err) reject(err);
          else {
            console.log(`🗑️ Dropped table: ${tableName}`);
            resolve();
          }
        });
      });
    }
    
    console.log('✅ All tables dropped. Re-initializing...');
    await closeConnection(db);
    db = null;
    
    // Re-initialize with fresh schema
    return await initializeSchema();
    
  } catch (error) {
    console.error('💥 Schema reset failed:', error.message);
    throw error;
    
  } finally {
    if (db) {
      await closeConnection(db);
    }
  }
}

// Educational Export: Make schema functions available
module.exports = {
  initializeSchema,
  resetSchema,
  
  // Educational exports for custom usage
  createUsersTable,
  createMaterialsTable,
  createLocationsTable,
  createScansTable,
  createUserProgressTable,
  createIndexes,
  insertSampleData
};

// Educational Note: If this file is run directly, initialize schema
if (require.main === module) {
  console.log('🎓 Database Schema Initialization - Educational Mode');
  initializeSchema()
    .then(() => {
      console.log('🎉 Schema initialization completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Schema initialization failed:', error.message);
      process.exit(1);
    });
}