/**
 * User Routes for Rescan Educational Project
 * =========================================
 * 
 * Educational Focus: Learn RESTful API design, user management patterns,
 * and Express router configuration.
 * 
 * Key Learning Concepts:
 * - RESTful route conventions (GET, POST, PUT, DELETE)
 * - Express Router module pattern
 * - Request validation and error handling
 * - User authentication and authorization basics
 * - Educational response formatting
 */

const express = require('express');
const router = express.Router();

// Educational Note: Import middleware and utilities
const { asyncErrorHandler, createError } = require('../../middleware/errorHandler');

/**
 * Educational Route: GET /api/users
 * 
 * Demonstrates user listing with educational query parameters
 * Learn about: pagination, filtering, query parameter handling
 */
router.get('/', asyncErrorHandler(async (req, res) => {
  // Educational Note: Extract query parameters with defaults
  const {
    page = 1,
    limit = 10,
    level = null,
    sort = 'created_at'
  } = req.query;
  
  console.log(`📋 Listing users (page: ${page}, limit: ${limit})`);
  
  // TODO: Implement actual database query
  // For now, return educational mock data
  const mockUsers = [
    {
      id: 1,
      username: 'stem_student',
      display_name: 'STEM Learning Student',
      points: 100,
      level: 2,
      scans_count: 15,
      educational_level: 'beginner',
      created_at: new Date().toISOString()
    }
  ];
  
  res.json({
    success: true,
    data: {
      users: mockUsers,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total_pages: 1,
        total_count: mockUsers.length
      }
    },
    educational: {
      note: 'This endpoint demonstrates user listing with pagination',
      query_parameters: {
        page: 'Page number (default: 1)',
        limit: 'Items per page (default: 10, max: 50)',
        level: 'Filter by user level (1-10)',
        sort: 'Sort field (created_at, points, level)'
      }
    }
  });
}));

/**
 * Educational Route: GET /api/users/:id
 * 
 * Demonstrates single resource retrieval with parameter validation
 * Learn about: URL parameters, resource existence checking, error responses
 */
router.get('/:id', asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  
  // Educational Note: Validate ID parameter
  if (!id || isNaN(parseInt(id))) {
    throw createError.badRequest('User ID must be a valid number');
  }
  
  const userId = parseInt(id);
  console.log(`👤 Fetching user with ID: ${userId}`);
  
  // TODO: Implement actual database query
  // For now, return mock data or 404
  if (userId === 1) {
    const mockUser = {
      id: 1,
      username: 'stem_student',
      display_name: 'STEM Learning Student',
      email: 'student@educational.demo',
      points: 100,
      level: 2,
      scans_count: 15,
      educational_level: 'beginner',
      preferred_language: 'en',
      completed_tutorials: ['basic_recycling', 'plastic_types'],
      achievement_badges: ['first_scan', 'plastic_master'],
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: { user: mockUser },
      educational: {
        note: 'This endpoint demonstrates single user retrieval',
        privacy: 'In production, filter sensitive data based on requesting user'
      }
    });
  } else {
    throw createError.notFound(`User with ID ${userId} not found`);
  }
}));

/**
 * Educational Route: POST /api/users
 * 
 * Demonstrates user creation with validation
 * Learn about: request body validation, data sanitization, conflict handling
 */
router.post('/', asyncErrorHandler(async (req, res) => {
  const { username, display_name, email, preferred_language = 'en' } = req.body;
  
  console.log(`👥 Creating new user: ${username}`);
  
  // Educational Note: Basic validation
  if (!username || username.length < 3) {
    throw createError.badRequest('Username must be at least 3 characters long');
  }
  
  if (!display_name || display_name.trim().length === 0) {
    throw createError.badRequest('Display name is required');
  }
  
  // Educational Note: Email validation (basic)
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError.badRequest('Invalid email format');
  }
  
  // TODO: Check for username/email conflicts in database
  // TODO: Hash password if authentication is added
  // TODO: Insert into database
  
  // Educational Note: Mock successful creation
  const newUser = {
    id: Date.now(), // Mock ID generation
    username,
    display_name,
    email: email || null,
    points: 0,
    level: 1,
    scans_count: 0,
    educational_level: 'beginner',
    preferred_language,
    completed_tutorials: [],
    achievement_badges: [],
    created_at: new Date().toISOString(),
    is_active: true
  };
  
  res.status(201).json({
    success: true,
    data: { user: newUser },
    educational: {
      note: 'This endpoint demonstrates user creation with validation',
      next_steps: [
        'Add password hashing for authentication',
        'Implement email verification',
        'Add profile picture upload support'
      ]
    }
  });
}));

/**
 * Educational Route: PUT /api/users/:id
 * 
 * Demonstrates user profile updates with selective field updating
 * Learn about: PATCH vs PUT, field validation, authorization checks
 */
router.put('/:id', asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const { display_name, email, preferred_language, educational_level } = req.body;
  
  // Educational Note: Validate ID parameter
  if (!id || isNaN(parseInt(id))) {
    throw createError.badRequest('User ID must be a valid number');
  }
  
  const userId = parseInt(id);
  console.log(`✏️ Updating user ${userId}`);
  
  // TODO: Verify user exists
  // TODO: Check authorization (user can only update their own profile)
  // TODO: Validate updated fields
  // TODO: Update database
  
  if (userId === 1) {
    const updatedUser = {
      id: 1,
      username: 'stem_student',
      display_name: display_name || 'STEM Learning Student',
      email: email || 'student@educational.demo',
      preferred_language: preferred_language || 'en',
      educational_level: educational_level || 'beginner',
      updated_at: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: { user: updatedUser },
      educational: {
        note: 'This endpoint demonstrates selective profile updates',
        security: 'Add authorization to prevent users from updating others profiles'
      }
    });
  } else {
    throw createError.notFound(`User with ID ${userId} not found`);
  }
}));

/**
 * Educational Route: DELETE /api/users/:id
 * 
 * Demonstrates user account deletion with safety checks
 * Learn about: soft delete vs hard delete, data retention, cascade effects
 */
router.delete('/:id', asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const { confirm = false } = req.query;
  
  // Educational Note: Validate ID parameter
  if (!id || isNaN(parseInt(id))) {
    throw createError.badRequest('User ID must be a valid number');
  }
  
  const userId = parseInt(id);
  
  // Educational Note: Require confirmation for destructive operations
  if (!confirm || confirm !== 'true') {
    throw createError.badRequest(
      'Account deletion requires confirmation. Add ?confirm=true to confirm deletion.'
    );
  }
  
  console.log(`🗑️ Deleting user ${userId} (with confirmation)`);
  
  // TODO: Check authorization (admin or self-delete only)
  // TODO: Implement soft delete (is_active = false) in production
  // TODO: Handle related data (scans, progress records)
  
  res.json({
    success: true,
    data: { 
      message: `User ${userId} deleted successfully`,
      deleted_at: new Date().toISOString()
    },
    educational: {
      note: 'This endpoint demonstrates safe deletion patterns',
      best_practices: [
        'Require explicit confirmation for destructive operations',
        'Consider soft delete to preserve data integrity',
        'Handle cascading effects on related data',
        'Log deletion events for audit trails'
      ]
    }
  });
}));

/**
 * Educational Route: GET /api/users/:id/progress
 * 
 * Demonstrates nested resource access for user educational progress
 * Learn about: nested routes, aggregated data, user-specific filtering
 */
router.get('/:id/progress', asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const { topic = null } = req.query;
  
  // Educational Note: Validate ID parameter
  if (!id || isNaN(parseInt(id))) {
    throw createError.badRequest('User ID must be a valid number');
  }
  
  const userId = parseInt(id);
  console.log(`📊 Fetching progress for user ${userId}${topic ? ` (topic: ${topic})` : ''}`);
  
  // TODO: Implement database query for user_progress table
  // TODO: Add authorization check
  
  const mockProgress = [
    {
      topic: 'recycling_symbols',
      current_level: 2,
      experience_points: 150,
      mastery_percentage: 65.5,
      questions_attempted: 20,
      questions_correct: 16,
      scans_completed: 8,
      last_activity_date: new Date().toISOString()
    },
    {
      topic: 'material_types',
      current_level: 1,
      experience_points: 75,
      mastery_percentage: 30.0,
      questions_attempted: 10,
      questions_correct: 7,
      scans_completed: 3,
      last_activity_date: new Date().toISOString()
    }
  ];
  
  // Educational Note: Filter by topic if specified
  const filteredProgress = topic 
    ? mockProgress.filter(p => p.topic === topic)
    : mockProgress;
  
  res.json({
    success: true,
    data: { 
      user_id: userId,
      progress: filteredProgress,
      summary: {
        total_topics: filteredProgress.length,
        average_mastery: filteredProgress.reduce((sum, p) => sum + p.mastery_percentage, 0) / filteredProgress.length,
        total_scans: filteredProgress.reduce((sum, p) => sum + p.scans_completed, 0)
      }
    },
    educational: {
      note: 'This endpoint demonstrates nested resource access for user progress',
      available_topics: ['recycling_symbols', 'material_types', 'environmental_impact', 'sorting_techniques']
    }
  });
}));

// Educational Export: Make router available to main application
module.exports = router;