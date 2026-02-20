/**
 * Educational Service: Database Operations
 * 
 * Provides centralized database operations for all entities
 * Learn about: service layer architecture, database abstraction, async/await patterns
 */

const { createConnection } = require('../config/database');

/**
 * Educational Class: Database Service
 * 
 * Demonstrates service layer pattern for database operations
 * Provides reusable database operations for all entities
 */
class DatabaseService {
  constructor() {
    this.db = null;
  }

  /**
   * Educational Method: Initialize Database Connection
   * 
   * Establishes connection for service operations
   * Learn about: connection management, error handling
   */
  async initialize() {
    try {
      this.db = await createConnection();
      console.log('📊 Database service initialized');
      return true;
    } catch (error) {
      console.error('❌ Database service initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Educational Method: Address Lookup
   * 
   * Searches for address and returns existing data or preparation for new entry
   * Learn about: database queries, data validation, business logic
   * 
   * @param {string} streetAddress - The street address to look up
   * @returns {Promise<Object>} Address data or creation info
   */
  async lookupAddress(streetAddress) {
    try {
      // Educational Note: Input validation and sanitization
      if (!streetAddress || typeof streetAddress !== 'string') {
        throw new Error('Invalid street address provided');
      }

      const cleanAddress = streetAddress.trim();
      if (cleanAddress.length === 0) {
        throw new Error('Street address cannot be empty');
      }

      console.log(`🔍 Looking up address: "${cleanAddress}"`);

      // Educational Note: Database query with prepared statements
      const query = `
        SELECT 
          street_address,
          points_total,
          is_active,
          created_at,
          updated_at
        FROM addresses 
        WHERE LOWER(street_address) = LOWER(?)
        AND is_active = 1
      `;

      const result = await new Promise((resolve, reject) => {
        this.db.get(query, [cleanAddress], (err, row) => {
          if (err) {
            console.error('❌ Address lookup query failed:', err.message);
            reject(err);
          } else {
            resolve(row);
          }
        });
      });

      // Educational Note: Return existing address data if found
      if (result) {
        console.log(`✅ Address found: ${cleanAddress} with ${result.points_total} points`);
        return {
          exists: true,
          address: {
            street_address: result.street_address,
            points_total: result.points_total,
            is_active: result.is_active,
            created_at: result.created_at,
            updated_at: result.updated_at
          },
          message: `Address found with ${result.points_total} recycling points`
        };
      }

      // Educational Note: Address not found - prepare creation info
      console.log(`📝 Address not found: ${cleanAddress} - ready for creation`);
      return {
        exists: false,
        address: {
          street_address: cleanAddress,
          points_total: 0,
          ready_for_creation: true
        },
        message: 'Address not found - will be created with 0 points when first scan is completed'
      };

    } catch (error) {
      console.error('❌ Address lookup failed:', error.message);
      throw error;
    }
  }

  /**
   * Educational Method: Create New Address
   * 
   * Creates a new address entry with initial 0 points
   * Learn about: INSERT operations, data integrity, business rules
   * 
   * @param {string} streetAddress - The street address to create
   * @returns {Promise<Object>} Created address data
   */
  async createAddress(streetAddress) {
    try {
      // Educational Note: Input validation
      if (!streetAddress || typeof streetAddress !== 'string') {
        throw new Error('Invalid street address provided');
      }

      const cleanAddress = streetAddress.trim();
      if (cleanAddress.length === 0) {
        throw new Error('Street address cannot be empty');
      }

      console.log(`📝 Creating new address: "${cleanAddress}"`);

      // Educational Note: Check if address already exists to prevent duplicates
      const existingCheck = await this.lookupAddress(cleanAddress);
      if (existingCheck.exists) {
        console.log(`⚠️ Address already exists: ${cleanAddress}`);
        return existingCheck;
      }

      // Educational Note: INSERT with prepared statements for security
      const insertQuery = `
        INSERT INTO addresses (
          street_address,
          points_total,
          is_active,
          created_at
        ) VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `;

      const insertResult = await new Promise((resolve, reject) => {
        this.db.run(insertQuery, [cleanAddress, 0, 1], function(err) {
          if (err) {
            console.error('❌ Address creation failed:', err.message);
            reject(err);
          } else {
            console.log(`✅ Address created: ${cleanAddress} (Row ID: ${this.lastID})`);
            resolve(this.lastID);
          }
        });
      });

      // Educational Note: Return the newly created address data
      return {
        exists: true,
        created: true,
        address: {
          street_address: cleanAddress,
          points_total: 0,
          is_active: true,
          created_at: new Date().toISOString()
        },
        message: `New address created: ${cleanAddress} with 0 points`
      };

    } catch (error) {
      console.error('❌ Address creation failed:', error.message);
      throw error;
    }
  }

  /**
   * Educational Method: Update Address Points
   * 
   * Updates the recycling points for an address
   * Learn about: UPDATE operations, atomic transactions, point calculations
   * 
   * @param {string} streetAddress - The address to update
   * @param {number} pointsToAdd - Points to add (can be negative)
   * @returns {Promise<Object>} Updated address data
   */
  async updateAddressPoints(streetAddress, pointsToAdd) {
    try {
      // Educational Note: Input validation for address and points
      if (!streetAddress || typeof streetAddress !== 'string') {
        throw new Error('Invalid street address provided');
      }

      if (typeof pointsToAdd !== 'number' || isNaN(pointsToAdd)) {
        throw new Error('Invalid points value - must be a number');
      }

      const cleanAddress = streetAddress.trim();
      console.log(`🎯 Updating points for ${cleanAddress}: ${pointsToAdd > 0 ? '+' : ''}${pointsToAdd}`);

      // Educational Note: First get current points to calculate new total
      const currentData = await this.lookupAddress(cleanAddress);
      if (!currentData.exists) {
        throw new Error(`Address not found: ${cleanAddress}`);
      }

      const newTotal = currentData.address.points_total + pointsToAdd;
      
      // Educational Note: Prevent negative points (business rule)
      if (newTotal < 0) {
        throw new Error(`Cannot reduce points below 0. Current: ${currentData.address.points_total}, Attempted change: ${pointsToAdd}`);
      }

      // Educational Note: UPDATE with prepared statement
      const updateQuery = `
        UPDATE addresses 
        SET 
          points_total = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE LOWER(street_address) = LOWER(?)
        AND is_active = 1
      `;

      await new Promise((resolve, reject) => {
        this.db.run(updateQuery, [newTotal, cleanAddress], function(err) {
          if (err) {
            console.error('❌ Points update failed:', err.message);
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('No address was updated - address may not exist or be inactive'));
          } else {
            console.log(`✅ Points updated: ${cleanAddress} now has ${newTotal} points`);
            resolve();
          }
        });
      });

      // Educational Note: Return updated address data
      return {
        exists: true,
        address: {
          street_address: cleanAddress,
          points_total: newTotal,
          points_added: pointsToAdd,
          previous_total: currentData.address.points_total
        },
        message: `Address points updated: ${cleanAddress} now has ${newTotal} points (${pointsToAdd > 0 ? '+' : ''}${pointsToAdd})`
      };

    } catch (error) {
      console.error('❌ Address points update failed:', error.message);
      throw error;
    }
  }

  /**
   * Educational Method: Get All Addresses
   * 
   * Retrieves all active addresses for administrative viewing
   * Learn about: SELECT queries, data listing, pagination concepts
   * 
   * @param {number} limit - Maximum number of addresses to return (default 50)
   * @returns {Promise<Array>} Array of address objects
   */
  async getAllAddresses(limit = 50) {
    try {
      console.log(`📋 Retrieving all addresses (limit: ${limit})`);

      // Educational Note: SELECT with LIMIT for performance
      const query = `
        SELECT 
          street_address,
          points_total,
          is_active,
          created_at,
          updated_at
        FROM addresses 
        WHERE is_active = 1
        ORDER BY points_total DESC, created_at DESC
        LIMIT ?
      `;

      const results = await new Promise((resolve, reject) => {
        this.db.all(query, [limit], (err, rows) => {
          if (err) {
            console.error('❌ Get all addresses query failed:', err.message);
            reject(err);
          } else {
            resolve(rows || []);
          }
        });
      });

      console.log(`✅ Retrieved ${results.length} addresses`);
      return results;

    } catch (error) {
      console.error('❌ Get all addresses failed:', error.message);
      throw error;
    }
  }

  /**
   * Educational Method: Close Database Connection
   * 
   * Properly closes the database connection
   * Learn about: resource cleanup, graceful shutdown
   */
  async close() {
    if (this.db) {
      await new Promise((resolve, reject) => {
        this.db.close((err) => {
          if (err) {
            console.error('❌ Database close failed:', err.message);
            reject(err);
          } else {
            console.log('📊 Database service connection closed');
            resolve();
          }
        });
      });
      this.db = null;
    }
  }
}

// Educational Note: Export singleton instance for application use
module.exports = new DatabaseService();