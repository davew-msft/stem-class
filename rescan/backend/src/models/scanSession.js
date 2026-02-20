/**
 * Educational Model: ScanSession
 * 
 * Represents individual recycling scan sessions for tracking and learning
 * Learn about: audit trails, session data, foreign key relationships
 */

const { v4: uuidv4 } = require('uuid');

/**
 * Educational Class: ScanSession
 * 
 * Demonstrates audit logging and transaction data modeling
 * Tracks individual scan attempts for educational review and points calculation
 */
class ScanSession {
  /**
   * Educational Constructor: Initialize ScanSession
   * 
   * Learn about: data validation, UUID generation, business object creation
   */
  constructor(data = {}) {
    // Educational Note: Generate unique session ID
    this.session_id = data.session_id || uuidv4();
    
    // Educational Note: Required foreign key relationship
    this.address = data.address; // Links to Address.street_address
    
    // Educational Note: AI analysis results
    this.material_type = data.material_type; // e.g., "1 PET", "5 PP"
    this.is_recyclable = data.is_recyclable; // Boolean recyclability
    this.confidence_score = data.confidence_score; // AI confidence 0.0-1.0
    
    // Educational Note: Points and gamification
    this.points_awarded = data.points_awarded || 0;
    this.bonus_points = data.bonus_points || 0;
    
    // Educational Note: Image processing data
    this.original_filename = data.original_filename;
    this.file_size_bytes = data.file_size_bytes;
    this.image_dimensions = data.image_dimensions; // "width x height"
    
    // Educational Note: AI service response data
    this.image_analysis_result = data.image_analysis_result; // Full AI response JSON
    this.processing_time_ms = data.processing_time_ms;
    
    // Educational Note: Educational context
    this.educational_content = data.educational_content; // Learning information provided
    this.user_feedback = data.user_feedback; // Optional user rating of accuracy
    
    // Educational Note: Timestamps
    this.scan_timestamp = data.scan_timestamp || new Date().toISOString();
    
    // Educational Note: Metadata for debugging and learning
    this.scan_method = data.scan_method || 'upload'; // 'upload', 'camera', 'manual'
    this.device_type = data.device_type || 'unknown'; // 'mobile', 'desktop', 'tablet'
  }

  /**
   * Educational Method: Validate ScanSession Data
   * 
   * Validates all required fields and business rules
   * Learn about: data validation, business logic, error handling
   */
  validate() {
    const errors = [];

    // Educational Note: Required field validation
    if (!this.session_id) {
      errors.push('Session ID is required');
    }

    if (!this.address || this.address.trim().length === 0) {
      errors.push('Address is required and cannot be empty');
    }

    if (!this.material_type || this.material_type.trim().length === 0) {
      errors.push('Material type is required');
    }

    if (typeof this.is_recyclable !== 'boolean') {
      errors.push('Is recyclable must be a boolean value');
    }

    // Educational Note: Numeric field validation
    if (typeof this.points_awarded !== 'number' || this.points_awarded < 0) {
      errors.push('Points awarded must be a non-negative number');
    }

    if (this.confidence_score !== null && this.confidence_score !== undefined) {
      if (typeof this.confidence_score !== 'number' || 
          this.confidence_score < 0 || this.confidence_score > 1) {
        errors.push('Confidence score must be a number between 0 and 1');
      }
    }

    // Educational Note: Business rule validation
    if (this.points_awarded > 0 && !['upload', 'camera', 'manual'].includes(this.scan_method)) {
      errors.push('Invalid scan method for scored scan');
    }

    // Educational Note: File size validation (10MB limit)
    if (this.file_size_bytes && this.file_size_bytes > 10 * 1024 * 1024) {
      errors.push('File size cannot exceed 10MB');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Educational Method: Calculate Points Based on Recyclability
   * 
   * Implements business logic for educational point system
   * Learn about: business rules, conditional logic, reward systems
   */
  calculatePoints() {
    // Educational Note: Base point system
    if (this.is_recyclable) {
      this.points_awarded = 100; // High reward for recyclable items
    } else {
      this.points_awarded = 10;  // Learning points for non-recyclable items
    }

    // Educational Note: Confidence bonus (high-confidence scans get extra points)
    if (this.confidence_score && this.confidence_score >= 0.9) {
      this.bonus_points = 25; // Bonus for clear, accurate scans
    } else if (this.confidence_score && this.confidence_score >= 0.7) {
      this.bonus_points = 10; // Small bonus for good quality scans
    }

    // Educational Note: First scan bonus (encouragement for new users)
    // This would be set by the caller based on address history
    
    console.log(`✅ Points calculated: ${this.points_awarded} base + ${this.bonus_points} bonus = ${this.getTotalPoints()}`);
  }

  /**
   * Educational Method: Get Total Points
   * 
   * Returns sum of base points and bonus points
   * Learn about: calculated properties, data aggregation
   */
  getTotalPoints() {
    return (this.points_awarded || 0) + (this.bonus_points || 0);
  }

  /**
   * Educational Method: Generate Educational Content
   * 
   * Creates educational information based on the identified material
   * Learn about: content generation, educational messaging, user engagement
   */
  generateEducationalContent() {
    const materialInfo = {
      '1 PET': {
        name: 'PET Plastic (Polyethylene Terephthalate)',
        uses: 'Water bottles, food containers, clothing fibers',
        recycling: 'Widely recyclable - can be made into new bottles, clothing, and carpet',
        tips: 'Remove caps and labels, rinse clean before recycling'
      },
      '2 HDPE': {
        name: 'HDPE Plastic (High-Density Polyethylene)',
        uses: 'Milk jugs, detergent bottles, shopping bags',
        recycling: 'Highly recyclable - becomes new containers, pipes, and plastic lumber',
        tips: 'Rinse containers and remove paper labels for best recycling results'
      },
      '3 PVC': {
        name: 'PVC Plastic (Polyvinyl Chloride)',
        uses: 'Bottles, blister packaging, vinyl records',
        recycling: 'Limited recycling - check local programs for special handling',
        tips: 'Often not accepted in curbside recycling due to chemical concerns'
      },
      '4 LDPE': {
        name: 'LDPE Plastic (Low-Density Polyethylene)',
        uses: 'Plastic bags, squeeze bottles, lids',
        recycling: 'Special recycling required - bring bags to grocery store collection bins',
        tips: 'Never put plastic bags in curbside recycling - they jam machinery'
      },
      '5 PP': {
        name: 'PP Plastic (Polypropylene)',
        uses: 'Yogurt containers, bottle caps, straws',
        recycling: 'Increasingly recyclable - becomes new containers and automotive parts',
        tips: 'Check if your local program accepts #5 plastics'
      },
      '6 PS': {
        name: 'PS Plastic (Polystyrene)',
        uses: 'Disposable cups, takeout containers, foam packaging',
        recycling: 'Rarely recyclable in most areas - avoid when possible',
        tips: 'Look for foam-free alternatives and reusable options'
      },
      '7 OTHER': {
        name: 'Other Plastics (Mixed or Other)',
        uses: 'Multi-layer packaging, some water bottles, electronics',
        recycling: 'Usually not recyclable - varies by specific material',
        tips: 'Focus on reducing use of mixed-material items'
      }
    };

    const material = materialInfo[this.material_type] || {
      name: 'Unknown Material',
      uses: 'Material not clearly identified',
      recycling: 'Unable to determine recyclability',
      tips: 'Try taking a clearer photo with better lighting'
    };

    this.educational_content = {
      material_name: material.name,
      common_uses: material.uses,
      recycling_info: material.recycling,
      helpful_tips: material.tips,
      points_explanation: this.is_recyclable 
        ? `Great job! You earned ${this.getTotalPoints()} points for identifying a recyclable item.`
        : `Good learning! You earned ${this.getTotalPoints()} points for practicing material identification.`,
      environmental_impact: this.is_recyclable
        ? 'Recycling this material helps reduce landfill waste and conserves natural resources!'
        : 'While not recyclable, knowing this helps you make better choices in the future.'
    };

    console.log(`📚 Educational content generated for ${this.material_type}`);
    return this.educational_content;
  }

  /**
   * Educational Method: Convert to Database Record
   * 
   * Prepares object for database insertion
   * Learn about: data serialization, database preparation, type conversion
   */
  toDbRecord() {
    return {
      session_id: this.session_id,
      address: this.address,
      material_type: this.material_type,
      is_recyclable: this.is_recyclable ? 1 : 0, // Convert boolean to integer for SQLite
      confidence_score: this.confidence_score,
      points_awarded: this.points_awarded || 0,
      bonus_points: this.bonus_points || 0,
      original_filename: this.original_filename,
      file_size_bytes: this.file_size_bytes,
      image_dimensions: this.image_dimensions,
      image_analysis_result: JSON.stringify(this.image_analysis_result || {}),
      processing_time_ms: this.processing_time_ms,
      educational_content: JSON.stringify(this.educational_content || {}),
      user_feedback: this.user_feedback,
      scan_timestamp: this.scan_timestamp,
      scan_method: this.scan_method,
      device_type: this.device_type
    };
  }

  /**
   * Educational Static Method: Create from Database Record
   * 
   * Creates ScanSession object from database row
   * Learn about: static methods, object construction, data deserialization
   */
  static fromDbRecord(dbRecord) {
    const data = {
      ...dbRecord,
      is_recyclable: dbRecord.is_recyclable === 1, // Convert integer back to boolean
      image_analysis_result: dbRecord.image_analysis_result ? 
        JSON.parse(dbRecord.image_analysis_result) : null,
      educational_content: dbRecord.educational_content ? 
        JSON.parse(dbRecord.educational_content) : null
    };

    return new ScanSession(data);
  }
}

/**
 * Educational Class: ScanSessionRepository
 * 
 * Database operations for ScanSession entities
 * Learn about: repository pattern, database abstraction, transaction management
 */
class ScanSessionRepository {
  constructor(dbService) {
    this.dbService = dbService;
  }

  /**
   * Educational Method: Create New Scan Session
   * 
   * Inserts scan session and updates address points in a transaction
   * Learn about: database transactions, ACID properties, error handling
   */
  async createScanSession(scanSession) {
    try {
      // Educational Note: Validate before database operation
      const validation = scanSession.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Educational Note: Calculate points if not already set
      if (scanSession.points_awarded === 0 && scanSession.is_recyclable !== null) {
        scanSession.calculatePoints();
        scanSession.generateEducationalContent();
      }

      console.log(`📊 Creating scan session: ${scanSession.session_id} for address: ${scanSession.address}`);

      // Educational Note: Ensure database service is initialized
      if (!this.dbService.db) {
        await this.dbService.initialize();
      }

      const dbRecord = scanSession.toDbRecord();

      // Educational Note: Begin transaction for atomic operation
      await new Promise((resolve, reject) => {
        this.dbService.db.serialize(() => {
          this.dbService.db.run('BEGIN TRANSACTION', (err) => {
            if (err) {
              console.error('❌ Transaction begin failed:', err.message);
              reject(err);
              return;
            }

            // Educational Note: Insert scan session record
            const insertSql = `
              INSERT INTO scan_sessions (
                session_id, address, material_type, is_recyclable, confidence_score,
                points_awarded, bonus_points, original_filename, file_size_bytes,
                image_dimensions, image_analysis_result, processing_time_ms,
                educational_content, user_feedback, scan_timestamp, scan_method, device_type
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            this.dbService.db.run(insertSql, [
              dbRecord.session_id, dbRecord.address, dbRecord.material_type,
              dbRecord.is_recyclable, dbRecord.confidence_score,
              dbRecord.points_awarded, dbRecord.bonus_points,
              dbRecord.original_filename, dbRecord.file_size_bytes,
              dbRecord.image_dimensions, dbRecord.image_analysis_result,
              dbRecord.processing_time_ms, dbRecord.educational_content,
              dbRecord.user_feedback, dbRecord.scan_timestamp,
              dbRecord.scan_method, dbRecord.device_type
            ], function(insertErr) {
              if (insertErr) {
                console.error('❌ Scan session insert failed:', insertErr.message);
                this.db.run('ROLLBACK');
                reject(insertErr);
                return;
              }

              // Educational Note: Update address points
              const totalPoints = scanSession.getTotalPoints();
              const updateSql = `
                UPDATE addresses 
                SET points_total = points_total + ?, updated_at = CURRENT_TIMESTAMP
                WHERE LOWER(street_address) = LOWER(?)
              `;

              this.db.run(updateSql, [totalPoints, scanSession.address], function(updateErr) {
                if (updateErr) {
                  console.error('❌ Address points update failed:', updateErr.message);
                  this.db.run('ROLLBACK');
                  reject(updateErr);
                  return;
                }

                if (this.changes === 0) {
                  console.error('❌ No address found for points update:', scanSession.address);
                  this.db.run('ROLLBACK');
                  reject(new Error(`Address not found: ${scanSession.address}`));
                  return;
                }

                // Educational Note: Commit transaction
                this.db.run('COMMIT', (commitErr) => {
                  if (commitErr) {
                    console.error('❌ Transaction commit failed:', commitErr.message);
                    reject(commitErr);
                  } else {
                    console.log(`✅ Scan session created and ${totalPoints} points added to ${scanSession.address}`);
                    resolve(scanSession);
                  }
                });
              }.bind(this));
            }.bind(this));
          });
        });
      });

      return scanSession;

    } catch (error) {
      console.error('❌ Create scan session failed:', error.message);
      throw error;
    }
  }

  /**
   * Educational Method: Get Scan Sessions by Address
   * 
   * Retrieves scan history for learning review and progress tracking
   * Learn about: query optimization, result filtering, educational analytics
   */
  async getScanSessionsByAddress(address, limit = 20) {
    try {
      console.log(`🔍 Retrieving scan sessions for address: ${address} (limit: ${limit})`);

      if (!this.dbService.db) {
        await this.dbService.initialize();
      }

      const query = `
        SELECT * FROM scan_sessions
        WHERE LOWER(address) = LOWER(?)
        ORDER BY scan_timestamp DESC
        LIMIT ?
      `;

      const rows = await new Promise((resolve, reject) => {
        this.dbService.db.all(query, [address, limit], (err, rows) => {
          if (err) {
            console.error('❌ Get scan sessions query failed:', err.message);
            reject(err);
          } else {
            resolve(rows || []);
          }
        });
      });

      // Educational Note: Convert database records back to ScanSession objects
      const scanSessions = rows.map(row => ScanSession.fromDbRecord(row));

      console.log(`✅ Retrieved ${scanSessions.length} scan sessions for ${address}`);
      return scanSessions;

    } catch (error) {
      console.error('❌ Get scan sessions failed:', error.message);
      throw error;
    }
  }

  /**
   * Educational Method: Get Scan Session by ID
   * 
   * Retrieves specific scan session for detailed review
   * Learn about: primary key lookups, individual record retrieval
   */
  async getScanSessionById(sessionId) {
    try {
      console.log(`🔍 Retrieving scan session: ${sessionId}`);

      if (!this.dbService.db) {
        await this.dbService.initialize();
      }

      const query = `
        SELECT * FROM scan_sessions
        WHERE session_id = ?
      `;

      const row = await new Promise((resolve, reject) => {
        this.dbService.db.get(query, [sessionId], (err, row) => {
          if (err) {
            console.error('❌ Get scan session query failed:', err.message);
            reject(err);
          } else {
            resolve(row);
          }
        });
      });

      if (!row) {
        console.log(`❌ Scan session not found: ${sessionId}`);
        return null;
      }

      const scanSession = ScanSession.fromDbRecord(row);
      console.log(`✅ Retrieved scan session: ${sessionId}`);
      return scanSession;

    } catch (error) {
      console.error('❌ Get scan session by ID failed:', error.message);
      throw error;
    }
  }

  /**
   * Educational Method: Update User Feedback
   * 
   * Allows users to provide feedback on AI accuracy for educational improvement
   * Learn about: user feedback loops, data quality, continuous improvement
   */
  async updateUserFeedback(sessionId, feedback) {
    try {
      console.log(`📝 Updating user feedback for session: ${sessionId}`);

      if (!this.dbService.db) {
        await this.dbService.initialize();
      }

      // Educational Note: Validate feedback options
      const validFeedback = ['correct', 'incorrect', 'partially_correct', 'unsure'];
      if (!validFeedback.includes(feedback)) {
        throw new Error(`Invalid feedback. Must be one of: ${validFeedback.join(', ')}`);
      }

      const updateSql = `
        UPDATE scan_sessions 
        SET user_feedback = ?, updated_at = CURRENT_TIMESTAMP
        WHERE session_id = ?
      `;

      await new Promise((resolve, reject) => {
        this.dbService.db.run(updateSql, [feedback, sessionId], function(err) {
          if (err) {
            console.error('❌ User feedback update failed:', err.message);
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error(`Scan session not found: ${sessionId}`));
          } else {
            console.log(`✅ User feedback updated for session: ${sessionId}`);
            resolve();
          }
        });
      });

    } catch (error) {
      console.error('❌ Update user feedback failed:', error.message);
      throw error;
    }
  }
}

// Educational Note: Export classes for use in application
module.exports = {
  ScanSession,
  ScanSessionRepository
};