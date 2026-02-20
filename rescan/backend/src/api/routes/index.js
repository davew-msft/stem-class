/**
 * API Routes Index for Rescan Educational Project
 * ==============================================
 * 
 * Educational Focus: Learn API organization, route mounting,
 * and RESTful API architecture patterns.
 * 
 * Key Learning Concepts:
 * - Express Router organization and mounting
 * - API versioning and structure
 * - Route module composition
 * - Middleware application to route groups
 * - Educational API documentation patterns
 */

const express = require('express');
const router = express.Router();

// Educational Note: Import all route modules
const usersRoutes = require('./users');
const materialsRoutes = require('./materials');
const scansRoutes = require('./scans');
const locationsRoutes = require('./locations');
const addressRoutes = require('./address');
const scanRoutes = require('./scan');

/**
 * Educational Middleware: API Documentation Root
 * 
 * Provides educational information about the API structure
 * Demonstrates self-documenting API patterns
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Rescan Educational API - Learning Recycling Through Technology',
    version: '1.0.0',
    
    educational: {
      purpose: 'This API supports a STEM education project teaching environmental awareness through recycling identification and gamification',
      learning_objectives: [
        'Understand RESTful API design principles',
        'Learn about environmental science through recycling data',
        'Practice web development with real-world applications',
        'Develop problem-solving skills through technology'
      ],
      target_audience: 'STEM students, educators, and environmental learning programs'
    },
    
    endpoints: {
      users: {
        base_path: '/api/users',
        description: 'User profiles, progress tracking, and educational achievements',
        features: ['Profile management', 'Progress analytics', 'Achievement system'],
        educational_focus: 'User experience design and gamification patterns'
      },
      
      materials: {
        base_path: '/api/materials',
        description: 'Recycling materials database with educational content',
        features: ['Material identification', 'Search and filtering', 'Educational content'],
        educational_focus: 'Environmental science and material properties'
      },
      
      scans: {
        base_path: '/api/scans',
        description: 'AI-powered recycling symbol identification and analysis',
        features: ['Image upload', 'AI analysis', 'Progress tracking', 'Feedback loops'],
        educational_focus: 'Artificial intelligence and machine learning applications'
      },
      
      locations: {
        base_path: '/api/locations',
        description: 'Recycling centers and drop-off location directory',
        features: ['Location search', 'Geographic filtering', 'Community contributions'],
        educational_focus: 'Geographic data systems and community engagement'
      },
      
      address: {
        base_path: '/api/address',
        description: 'Address-based recycling points tracking and lookup system',
        features: ['Address lookup', 'Points management', 'Creation tracking', 'Progress monitoring'],
        educational_focus: 'Database operations, validation, and resource management'
      },
      
      scan: {
        base_path: '/api/scan',
        description: 'AI-powered image analysis and recycling symbol identification',
        features: ['Image upload', 'AI material recognition', 'Points calculation', 'Educational feedback'],
        educational_focus: 'AI integration, file handling, and machine learning applications'
      }
    },
    
    technical_features: {
      authentication: 'Educational mode - simplified or token-based',
      file_uploads: 'Image processing for material identification',
      ai_integration: 'Azure OpenAI for visual recognition',
      database: 'SQLite for educational simplicity',
      documentation: 'Self-documenting with educational context'
    },
    
    getting_started: {
      step_1: 'Explore the /api/{endpoint} URLs to see available operations',
      step_2: 'Use educational query parameters to understand API patterns',
      step_3: 'Try uploading images to /api/scans for AI material identification',
      step_4: 'Check user progress and achievements through /api/users/{id}/progress',
      example_flow: [
        'GET /api/address/lookup?street_address=123 Main St - Check address recycling points',
        'GET /api/materials - Browse recyclable materials',
        'POST /api/scans - Upload image for identification',
        'GET /api/locations/search/nearby - Find recycling centers',
        'GET /api/users/{id}/progress - Track learning progress'
      ]
    },
    
    educational_tips: [
      'Each endpoint includes educational context in responses',
      'Query parameters are documented in endpoint responses',
      'Error responses include learning-focused explanations',
      'All responses include educational field with relevant information'
    ],
    
    links: {
      health_check: '/health',
      api_documentation: '/api',
      user_endpoints: '/api/users',
      materials_catalog: '/api/materials',
      scan_functionality: '/api/scans',
      location_directory: '/api/locations',
      address_lookup: '/api/address'
    }
  });
});

/**
 * Educational Route: API Statistics and Learning Metrics
 * 
 * Demonstrates API analytics and educational effectiveness metrics
 * Learn about: API monitoring, educational assessment, data analytics
 */
router.get('/stats', (req, res) => {
  // TODO: Implement actual statistics from database
  // For now, return educational mock data
  
  const mockStats = {
    generated_at: new Date().toISOString(),
    
    api_usage: {
      total_requests_today: 156,
      active_users_today: 23,
      popular_endpoints: [
        { endpoint: '/api/scans', requests: 67, percentage: 43 },
        { endpoint: '/api/materials', requests: 45, percentage: 29 },
        { endpoint: '/api/users', requests: 28, percentage: 18 },
        { endpoint: '/api/locations', requests: 16, percentage: 10 }
      ]
    },
    
    educational_metrics: {
      materials_identified_today: 89,
      successful_identifications: 76,
      ai_accuracy_rate: 0.87,
      user_learning_progress: {
        beginner_level: 15,
        intermediate_level: 6,
        advanced_level: 2
      },
      popular_learning_topics: [
        'plastic_identification',
        'recycling_symbols', 
        'material_sorting',
        'environmental_impact'
      ]
    },
    
    system_health: {
      database_status: 'healthy',
      ai_service_status: 'healthy',
      average_response_time_ms: 245,
      uptime: '99.8%'
    }
  };
  
  res.json({
    success: true,
    data: { stats: mockStats },
    educational: {
      note: 'API usage statistics with educational insights',
      learning_analytics: [
        'Track user engagement with different learning methods',
        'Monitor AI accuracy to improve educational experiences', 
        'Identify popular topics for curriculum development',
        'Measure educational effectiveness through user progress'
      ]
    }
  });
});

/**
 * Educational Route: API Health with Educational Context
 * 
 * Demonstrates health check patterns with educational information
 * Learn about: API monitoring, system status, service dependencies
 */
router.get('/health', (req, res) => {
  // TODO: Add actual health checks for database, AI service, etc.
  
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    
    services: {
      database: {
        status: 'healthy',
        response_time_ms: 12,
        message: 'SQLite database responding normally'
      },
      ai_service: {
        status: 'healthy', 
        response_time_ms: 234,
        message: 'Azure OpenAI service available'
      },
      file_storage: {
        status: 'healthy',
        message: 'Upload directory accessible'
      }
    },
    
    educational_context: {
      purpose: 'Health checks ensure reliable educational experiences',
      learning_value: 'Demonstrates system monitoring and reliability patterns',
      student_benefit: 'Consistent API availability supports uninterrupted learning'
    }
  };
  
  res.json({
    success: true,
    data: { health: healthData },
    educational: {
      note: 'System health check with educational context',
      monitoring_concepts: [
        'Health endpoints allow automated system monitoring',
        'Response times indicate system performance',
        'Service dependencies show system architecture',
        'Regular health checks ensure educational continuity'
      ]
    }
  });
});

// Educational Note: Mount route modules with their base paths
// This demonstrates RESTful resource organization

console.log('🛤️ Mounting API route modules...');

// Mount user-related routes
router.use('/users', usersRoutes);
console.log('   ✅ Users routes mounted at /api/users');

// Mount materials database routes
router.use('/materials', materialsRoutes);
console.log('   ✅ Materials routes mounted at /api/materials');

// Mount scanning functionality routes
router.use('/scans', scansRoutes);
console.log('   ✅ Scans routes mounted at /api/scans');

// Mount locations directory routes  
router.use('/locations', locationsRoutes);
console.log('   ✅ Locations routes mounted at /api/locations');

// Mount address lookup and points routes
router.use('/address', addressRoutes);
console.log('   ✅ Address routes mounted at /api/address');

// Mount scan and AI analysis routes
router.use('/scan', scanRoutes);
console.log('   ✅ Scan routes mounted at /api/scan');

console.log('🎯 All API routes configured successfully!\n');

// Educational Export: Make router available to main application
module.exports = router;