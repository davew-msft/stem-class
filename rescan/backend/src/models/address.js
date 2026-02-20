/**
 * Address Model for Rescan Educational Project
 * ==========================================
 * 
 * Educational Focus: Learn data modeling, validation patterns, and business logic
 * implementation for location-based environmental tracking.
 * 
 * Key Learning Concepts:
 * - Data model definition and validation
 * - Primary key design and natural keys
 * - Business rule implementation
 * - SQLite integration patterns
 * - Educational data integrity
 */

const { createConnection, closeConnection } = require('../config/database');

/**
 * Educational Class: Address Model
 * 
 * Represents recycling points tracking by street address.
 * Demonstrates entity modeling and validation patterns.
 * 
 * Data Model:
 * - street_address (PK): User-entered address (normalized)
 * - points_total: Cumulative recycling points earned
 * - created_date: Account creation timestamp
 * - last_updated: Most recent activity timestamp
 */
class Address {
  /**
   * Educational Constructor: Create Address Instance
   * 
   * Demonstrates object initialization and validation
   * 
   * @param {Object} data - Address data
   * @param {string} data.street_address - Street address (primary key)
   * @param {number} data.points_total - Total points (defaults to 0)
   * @param {Date} data.created_date - Creation timestamp
   * @param {Date} data.last_updated - Last update timestamp
   */
  constructor(data = {}) {
    // Educational Note: Initialize with validation
    this.street_address = this.normalizeAddress(data.street_address || '');
    this.points_total = parseInt(data.points_total) || 0;
    this.created_date = data.created_date || new Date();
    this.last_updated = data.last_updated || new Date();
  }

  /**
   * Educational Method: Normalize Address for Consistent Storage
   * 
   * Demonstrates data normalization and consistency patterns
   * 
   * @param {string} address - Raw address input
   * @returns {string} Normalized address
   */
  normalizeAddress(address) {
    if (typeof address !== 'string') {
      return '';
    }
    
    // Educational Note: Normalize to lowercase and trim whitespace
    return address.trim().toLowerCase();
  }

  /**
   * Educational Method: Validate Address Data
   * 
   * Demonstrates validation patterns and business rules
   * 
   * @returns {Object} Validation result with success flag and errors
   */
  validate() {
    const errors = [];
    
    // Educational Note: Required field validation
    if (!this.street_address || this.street_address.trim().length === 0) {
      errors.push('Street address is required');
    }
    
    // Educational Note: Length validation
    if (this.street_address.length > 255) {
      errors.push('Street address must be 255 characters or less');
    }
    
    // Educational Note: Business rule validation
    if (this.points_total < 0) {
      errors.push('Points total cannot be negative');
    }
    
    if (!Number.isInteger(this.points_total)) {
      errors.push('Points total must be a whole number');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Educational Method: Convert to Database Format
   * 
   * Demonstrates data transformation for persistence
   * 
   * @returns {Object} Data formatted for database storage
   */
  toDatabase() {
    return {
      street_address: this.street_address,
      points_total: this.points_total,
      created_date: this.created_date.toISOString(),
      last_updated: this.last_updated.toISOString()
    };
  }

  /**
   * Educational Method: Convert to API Response Format
   * 
   * Demonstrates data transformation for client consumption
   * 
   * @returns {Object} Data formatted for API responses
   */
  toJSON() {
    return {
      street_address: this.street_address,
      points_total: this.points_total,
      created_date: this.created_date.toISOString(),
      last_updated: this.last_updated.toISOString(),
      educational: {
        note: 'Address data normalized for consistent recycling tracking',
        points_explanation: this.points_total === 0 ? 
          'No recycling scans recorded yet - start scanning to earn points!' :
          `${this.points_total} total points earned from recycling activities`
      }
    };
  }

  /**
   * Educational Static Method: Create Address from Database Row
   * 
   * Demonstrates factory pattern and data hydration
   * 
   * @param {Object} row - Database row data
   * @returns {Address} Address instance
   */
  static fromDatabase(row) {
    return new Address({
      street_address: row.street_address,
      points_total: row.points_total,
      created_date: new Date(row.created_date),
      last_updated: new Date(row.last_updated)
    });
  }

  /**
   * Educational Static Method: Validate Address Input
   * 
   * Demonstrates static validation without object creation
   * UPDATED: Now includes NJ geographic restriction validation
   * 
   * @param {string} address - Address to validate
   * @returns {Object} Validation result
   */
  static validateAddressString(address) {
    const normalized = Address.prototype.normalizeAddress(address);
    const errors = [];
    
    if (!normalized || normalized.trim().length === 0) {
      errors.push('Address cannot be empty');
    }
    
    if (normalized.length > 255) {
      errors.push('Address is too long (maximum 255 characters)');
    }
    
    // Educational Note: Basic format validation
    if (normalized.length > 0 && !/[a-z0-9]/.test(normalized)) {
      errors.push('Address must contain at least one letter or number');
    }
    
    // Educational Note: Check for potentially problematic characters
    if (/[<>"']/g.test(normalized)) {
      errors.push('Address contains invalid characters');
    }
    
    // Educational Note: NEW - NJ Geographic Restriction Validation
    if (normalized.length > 0) {
      const hasNJ = /\bnj\b|\bnew jersey\b/.test(normalized);
      if (!hasNJ) {
        errors.push('Only New Jersey addresses are supported. Please include "NJ" or "New Jersey" in your address.');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors,
      normalized: normalized,
      educational: {
        note: 'NJ address validation teaches geographic data constraints',
        tip: 'Try addresses like: "123 Main St, Newark, NJ" or "456 Oak Ave, Trenton, New Jersey"'
      }
    };
  }
}

/**
 * Educational Class: Address Database Operations
 * 
 * Demonstrates data access layer patterns and database operations
 * Separates business logic from database concerns
 */
class AddressRepository {
  /**
   * Educational Method: Find Address by Street Address
   * 
   * Demonstrates primary key lookup operations
   * 
   * @param {string} streetAddress - Address to look up
   * @returns {Promise<Address|null>} Address instance or null if not found
   */
  static async findByStreetAddress(streetAddress) {
    const normalizedAddress = Address.prototype.normalizeAddress(streetAddress);
    
    if (!normalizedAddress) {
      return null;
    }
    
    let db = null;
    
    try {
      console.log(`🔍 Looking up address: "${normalizedAddress}"`);
      
      db = await createConnection();
      
      const row = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM addresses WHERE street_address = ?',
          [normalizedAddress],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
      
      if (row) {
        console.log(`✅ Address found with ${row.points_total} points`);
        return Address.fromDatabase(row);
      } else {
        console.log(`📍 New address - not in database yet`);
        return null;
      }
      
    } catch (error) {
      console.error('❌ Error looking up address:', error.message);
      throw new Error(`Failed to lookup address: ${error.message}`);
      
    } finally {
      if (db) {
        await closeConnection(db);
      }
    }
  }

  /**
   * Educational Method: Create New Address
   * 
   * Demonstrates insert operations and initial state setup
   * 
   * @param {string} streetAddress - Address to create
   * @returns {Promise<Address>} Created address instance
   */
  static async create(streetAddress) {
    const validation = Address.validateAddressString(streetAddress);
    
    if (!validation.isValid) {
      throw new Error(`Invalid address: ${validation.errors.join(', ')}`);
    }
    
    // Educational Note: Create new address with default values
    const address = new Address({
      street_address: validation.normalized,
      points_total: 0,
      created_date: new Date(),
      last_updated: new Date()
    });
    
    // Educational Note: Validate business rules
    const addressValidation = address.validate();
    if (!addressValidation.isValid) {
      throw new Error(`Address validation failed: ${addressValidation.errors.join(', ')}`);
    }
    
    let db = null;
    
    try {
      console.log(`📝 Creating new address: "${address.street_address}"`);
      
      db = await createConnection();
      
      const dbData = address.toDatabase();
      
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO addresses (street_address, points_total, created_date, last_updated)
           VALUES (?, ?, ?, ?)`,
          [dbData.street_address, dbData.points_total, dbData.created_date, dbData.last_updated],
          function(err) {
            if (err) {
              if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                reject(new Error('Address already exists in database'));
              } else {
                reject(err);
              }
            } else {
              resolve();
            }
          }
        );
      });
      
      console.log(`✅ Address created successfully with 0 points`);
      return address;
      
    } catch (error) {
      console.error('❌ Error creating address:', error.message);
      throw new Error(`Failed to create address: ${error.message}`);
      
    } finally {
      if (db) {
        await closeConnection(db);
      }
    }
  }

  /**
   * Educational Method: Update Address Points
   * 
   * Demonstrates update operations and business rule enforcement
   * 
   * @param {string} streetAddress - Address to update
   * @param {number} pointsToAdd - Points to add (must be positive)
   * @returns {Promise<Address>} Updated address instance
   */
  static async updatePoints(streetAddress, pointsToAdd) {
    if (pointsToAdd < 0) {
      throw new Error('Cannot subtract points - points only increase');
    }
    
    if (!Number.isInteger(pointsToAdd)) {
      throw new Error('Points to add must be a whole number');
    }
    
    const normalizedAddress = Address.prototype.normalizeAddress(streetAddress);
    
    let db = null;
    
    try {
      console.log(`📈 Adding ${pointsToAdd} points to address: "${normalizedAddress}"`);
      
      db = await createConnection();
      
      // Educational Note: Use SQL transaction for atomic update
      await new Promise((resolve, reject) => {
        db.run('BEGIN TRANSACTION', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      // Educational Note: Update points with optimistic concurrency
      const result = await new Promise((resolve, reject) => {
        db.run(
          `UPDATE addresses 
           SET points_total = points_total + ?, 
               last_updated = ?
           WHERE street_address = ?`,
          [pointsToAdd, new Date().toISOString(), normalizedAddress],
          function(err) {
            if (err) reject(err);
            else resolve(this);
          }
        );
      });
      
      if (result.changes === 0) {
        await new Promise((resolve) => {
          db.run('ROLLBACK', () => resolve());
        });
        throw new Error('Address not found for points update');
      }
      
      // Educational Note: Commit transaction
      await new Promise((resolve, reject) => {
        db.run('COMMIT', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      // Educational Note: Return updated address
      const updatedAddress = await AddressRepository.findByStreetAddress(streetAddress);
      console.log(`✅ Points updated - new total: ${updatedAddress.points_total} points`);
      
      return updatedAddress;
      
    } catch (error) {
      // Educational Note: Rollback on error
      if (db) {
        await new Promise((resolve) => {
          db.run('ROLLBACK', () => resolve());
        });
      }
      
      console.error('❌ Error updating points:', error.message);
      throw new Error(`Failed to update points: ${error.message}`);
      
    } finally {
      if (db) {
        await closeConnection(db);
      }
    }
  }

  /**
   * Educational Method: Get or Create Address
   * 
   * Demonstrates common "upsert" pattern for user convenience
   * 
   * @param {string} streetAddress - Address to find or create
   * @returns {Promise<{address: Address, isNew: boolean}>} Address and creation flag
   */
  static async findOrCreate(streetAddress) {
    try {
      // Educational Note: Try to find existing address first
      const existingAddress = await AddressRepository.findByStreetAddress(streetAddress);
      
      if (existingAddress) {
        return { address: existingAddress, isNew: false };
      }
      
      // Educational Note: Create new address if not found
      const newAddress = await AddressRepository.create(streetAddress);
      return { address: newAddress, isNew: true };
      
    } catch (error) {
      console.error('❌ Error in findOrCreate:', error.message);
      throw error;
    }
  }
}

// Educational Export: Make both class and repository available
module.exports = {
  Address,
  AddressRepository
};