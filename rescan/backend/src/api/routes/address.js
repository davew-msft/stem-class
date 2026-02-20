/**
 * Educational Routes: Address Management
 * 
 * Provides REST endpoints for address lookup and points tracking
 * Learn about: REST API design, Express routing, middleware integration
 */

const express = require('express');
const router = express.Router();
const dbService = require('../../services/dbService');
const { Address } = require('../../models/address'); // Destructure Address from exports

/**
 * Educational Endpoint: Address Lookup
 * 
 * GET /api/address/lookup
 * Looks up an address and returns existing points or prepares for new entry
 * 
 * Query Parameters:
 * - street_address (required): The street address to look up
 * 
 * Learn about: query parameter validation, database integration, REST responses
 */
router.get('/lookup', async (req, res) => {
  try {
    // Educational Note: Extract and validate query parameters
    const { street_address } = req.query;
    
    console.log(`📍 Address lookup request for: "${street_address}"`);
    
    // Educational Note: Input validation for required parameters
    if (!street_address) {
      console.log('❌ Address lookup failed: Missing street_address parameter');
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_ADDRESS',
          message: 'street_address query parameter is required',
          details: 'Provide the street address as a query parameter: ?street_address=123 Main St'
        },
        educational_note: 'Always validate required parameters in API endpoints'
      });
    }

    // Educational Note: String validation and sanitization
    if (typeof street_address !== 'string' || street_address.trim().length === 0) {
      console.log('❌ Address lookup failed: Invalid street_address parameter');
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ADDRESS',
          message: 'street_address must be a non-empty string',
          details: 'The provided street_address parameter is empty or not a valid string'
        },
        educational_note: 'Input validation prevents invalid data from reaching the database'
      });
    }

    // Educational Note: NEW - NJ Geographic Validation
    const addressValidation = Address.validateAddressString(street_address);
    if (!addressValidation.isValid) {
      console.log(`❌ Address validation failed for: "${street_address}" - ${addressValidation.errors.join(', ')}`);
      return res.status(400).json({
        success: false,
        error: {
          code: 'NJ_ADDRESS_REQUIRED',
          message: 'Only New Jersey addresses are supported',
          details: addressValidation.errors,
          examples: [
            '123 Main Street, Newark, NJ',
            '456 Oak Avenue, Trenton, New Jersey',
            '789 Pine Road, Jersey City, NJ 07302'
          ]
        },
        educational_note: 'Geographic restrictions teach real-world data constraints and regional service limitations'
      });
    }

    // Educational Note: Initialize database service if needed
    if (!dbService.db) {
      console.log('🔌 Initializing database service for address lookup...');
      await dbService.initialize();
    }

    // Educational Note: Call database service for address lookup
    const lookupResult = await dbService.lookupAddress(street_address);
    
    console.log(`✅ Address lookup completed for: "${street_address}"`);
    
    // Educational Note: Return successful response with structured data
    res.status(200).json({
      success: true,
      data: {
        query: {
          street_address: street_address.trim(),
          lookup_timestamp: new Date().toISOString()
        },
        result: lookupResult,
        meta: {
          can_create_scan: true,
          next_steps: lookupResult.exists 
            ? 'Address is ready for recycling scans'
            : 'Address will be created automatically when first scan is completed'
        }
      },
      educational_note: lookupResult.exists
        ? 'Existing address found - points will be added to current total'
        : 'New address - will start with 0 points and grow with each successful scan'
    });

  } catch (error) {
    // Educational Note: Comprehensive error handling with logging
    console.error('❌ Address lookup endpoint error:', error.message);
    console.error('Stack trace:', error.stack);

    // Educational Note: Return appropriate error response based on error type
    if (error.message.includes('Invalid street address')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          details: 'The provided street address failed validation'
        },
        educational_note: 'Client errors (400) indicate invalid input from the user'
      });
    }

    // Educational Note: Database or server errors get 500 status
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to lookup address',
        details: 'An internal server error occurred during address lookup'
      },
      educational_note: 'Server errors (500) indicate problems with the backend service'
    });
  }
});

/**
 * Educational Endpoint: Create New Address
 * 
 * POST /api/address
 * Creates a new address with initial 0 points
 * 
 * Body Parameters:
 * - street_address (required): The street address to create
 * 
 * Learn about: POST requests, body parsing, resource creation
 */
router.post('/', async (req, res) => {
  try {
    // Educational Note: Extract data from request body
    const { street_address } = req.body;
    
    console.log(`📝 Address creation request for: "${street_address}"`);
    
    // Educational Note: Input validation for POST body
    if (!street_address) {
      console.log('❌ Address creation failed: Missing street_address in body');
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_ADDRESS',
          message: 'street_address is required in request body',
          details: 'Provide the street address in the JSON body: {"street_address": "123 Main St"}'
        },
        educational_note: 'POST requests typically receive data in the request body, not query parameters'
      });
    }

    // Educational Note: Type and content validation
    if (typeof street_address !== 'string' || street_address.trim().length === 0) {
      console.log('❌ Address creation failed: Invalid street_address in body');
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ADDRESS',
          message: 'street_address must be a non-empty string',
          details: 'The provided street_address is empty or not a valid string'
        },
        educational_note: 'Validate all input data types and content before processing'
      });
    }

    // Educational Note: Initialize database service if needed
    if (!dbService.db) {
      console.log('🔌 Initializing database service for address creation...');
      await dbService.initialize();
    }

    // Educational Note: Call database service to create address
    const createResult = await dbService.createAddress(street_address);
    
    console.log(`✅ Address creation completed for: "${street_address}"`);
    
    // Educational Note: Return 201 Created for successful resource creation
    const statusCode = createResult.created ? 201 : 200;
    
    res.status(statusCode).json({
      success: true,
      data: {
        request: {
          street_address: street_address.trim(),
          creation_timestamp: new Date().toISOString()
        },
        result: createResult,
        meta: {
          status: createResult.created ? 'newly_created' : 'already_exists',
          ready_for_scans: true
        }
      },
      educational_note: createResult.created
        ? 'New address created with 0 points - ready for recycling scans'
        : 'Address already exists - returned existing data'
    });

  } catch (error) {
    // Educational Note: Error handling for POST operations
    console.error('❌ Address creation endpoint error:', error.message);
    
    // Educational Note: Handle specific business logic errors
    if (error.message.includes('Invalid street address')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          details: 'The provided street address failed validation'
        },
        educational_note: 'Input validation errors should return 400 Bad Request'
      });
    }

    // Educational Note: Handle database constraint errors
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT_ERROR',
          message: 'Address already exists',
          details: 'An address with this street name already exists in the system'
        },
        educational_note: 'Resource conflicts should return 409 Conflict'
      });
    }

    // Educational Note: Generic server errors
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create address',
        details: 'An internal server error occurred during address creation'
      },
      educational_note: 'Unexpected server errors should return 500 Internal Server Error'
    });
  }
});

/**
 * Educational Endpoint: Update Address Points
 * 
 * PATCH /api/address/points
 * Updates the recycling points for an existing address
 * 
 * Body Parameters:
 * - street_address (required): The address to update
 * - points_to_add (required): Points to add (positive) or subtract (negative)
 * 
 * Learn about: PATCH requests, partial updates, business logic validation
 */
router.patch('/points', async (req, res) => {
  try {
    // Educational Note: Extract update data from body
    const { street_address, points_to_add } = req.body;
    
    console.log(`🎯 Points update request for: "${street_address}" (${points_to_add})`);
    
    // Educational Note: Validate required fields for update
    if (!street_address || points_to_add === undefined) {
      console.log('❌ Points update failed: Missing required fields');
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Both street_address and points_to_add are required',
          details: 'Provide both fields in JSON body: {"street_address": "123 Main St", "points_to_add": 10}'
        },
        educational_note: 'PATCH operations need to specify what to update and how'
      });
    }

    // Educational Note: Type validation for numeric operations
    if (typeof points_to_add !== 'number' || isNaN(points_to_add)) {
      console.log('❌ Points update failed: Invalid points_to_add value');
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_POINTS',
          message: 'points_to_add must be a valid number',
          details: 'Provide a numeric value for points: positive to add, negative to subtract'
        },
        educational_note: 'Numeric fields must be validated for type and mathematical operations'
      });
    }

    // Educational Note: Initialize database service if needed
    if (!dbService.db) {
      console.log('🔌 Initializing database service for points update...');
      await dbService.initialize();
    }

    // Educational Note: Call database service to update points
    const updateResult = await dbService.updateAddressPoints(street_address, points_to_add);
    
    console.log(`✅ Points update completed for: "${street_address}"`);
    
    // Educational Note: Return successful update response
    res.status(200).json({
      success: true,
      data: {
        request: {
          street_address: street_address.trim(),
          points_to_add: points_to_add,
          update_timestamp: new Date().toISOString()
        },
        result: updateResult,
        meta: {
          operation: points_to_add > 0 ? 'points_added' : 'points_subtracted',
          new_total: updateResult.address.points_total
        }
      },
      educational_note: 'PATCH operations should return the updated state of the resource'
    });

  } catch (error) {
    // Educational Note: Error handling for update operations
    console.error('❌ Address points update endpoint error:', error.message);
    
    // Educational Note: Handle business rule violations
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ADDRESS_NOT_FOUND',
          message: 'Address not found',
          details: error.message
        },
        educational_note: 'Resource not found errors should return 404 Not Found'
      });
    }

    // Educational Note: Handle business logic constraints
    if (error.message.includes('Cannot reduce points below 0')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_POINTS',
          message: 'Cannot reduce points below zero',
          details: error.message
        },
        educational_note: 'Business rule violations should return 400 Bad Request'
      });
    }

    // Educational Note: Generic server errors
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update address points',
        details: 'An internal server error occurred during points update'
      },
      educational_note: 'Unexpected errors should be logged and return 500'
    });
  }
});

/**
 * Educational Endpoint: List All Addresses
 * 
 * GET /api/address
 * Retrieves all active addresses for administrative purposes
 * 
 * Query Parameters:
 * - limit (optional): Maximum number of addresses to return (default 50)
 * 
 * Learn about: data listing, pagination, administrative endpoints
 */
router.get('/', async (req, res) => {
  try {
    // Educational Note: Optional query parameter with default
    const limit = parseInt(req.query.limit) || 50;
    
    console.log(`📋 Address list request (limit: ${limit})`);
    
    // Educational Note: Validate numeric parameter ranges
    if (limit < 1 || limit > 1000) {
      console.log('❌ Address list failed: Invalid limit parameter');
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_LIMIT',
          message: 'limit must be between 1 and 1000',
          details: 'Provide a reasonable limit for data retrieval'
        },
        educational_note: 'API limits prevent excessive data transfer and server load'
      });
    }

    // Educational Note: Initialize database service if needed
    if (!dbService.db) {
      console.log('🔌 Initializing database service for address listing...');
      await dbService.initialize();
    }

    // Educational Note: Call database service for listing
    const addresses = await dbService.getAllAddresses(limit);
    
    console.log(`✅ Address list completed: ${addresses.length} addresses retrieved`);
    
    // Educational Note: Return list response with metadata
    res.status(200).json({
      success: true,
      data: {
        addresses: addresses,
        meta: {
          count: addresses.length,
          limit: limit,
          retrieved_at: new Date().toISOString(),
          has_more: addresses.length === limit
        }
      },
      educational_note: 'List endpoints should include metadata about the results'
    });

  } catch (error) {
    // Educational Note: Error handling for list operations
    console.error('❌ Address list endpoint error:', error.message);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to retrieve addresses',
        details: 'An internal server error occurred during address listing'
      },
      educational_note: 'List operation failures are typically server errors'
    });
  }
});

// Educational Note: Export router for use in main application
module.exports = router;