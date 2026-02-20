/**
 * Scans Routes for Rescan Educational Project
 * ==========================================
 * 
 * Educational Focus: Learn file upload handling, AI integration,
 * user activity tracking, and educational progress monitoring.
 * 
 * Key Learning Concepts:
 * - File upload and image processing
 * - AI service integration patterns
 * - Activity logging and gamification
 * - Educational feedback and progress tracking
 * - Real-time processing and response patterns
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Educational Note: Import middleware and utilities
const { asyncErrorHandler, createError } = require('../../middleware/errorHandler');

// Educational Note: Configure multer for file uploads
const storage = multer.diskStorage({
  // Educational Note: Define upload destination
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../../../public/uploads');
    cb(null, uploadDir);
  },
  
  // Educational Note: Generate unique filename to prevent conflicts
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'scan-' + uniqueSuffix + extension);
  }
});

// Educational Note: File validation for security and learning
const fileFilter = (req, file, cb) => {
  // Educational Note: Check file type
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);
  
  if (mimeType && extName) {
    console.log(`📸 Accepting uploaded file: ${file.originalname} (${file.mimetype})`);
    return cb(null, true);
  } else {
    console.warn(`❌ Rejected file upload: ${file.originalname} (${file.mimetype})`);
    return cb(createError.badRequest('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for educational purposes
  },
  fileFilter: fileFilter
});

/**
 * Educational Route: GET /api/scans
 * 
 * Demonstrates user scan history retrieval with filtering
 * Learn about: activity logs, pagination, user-specific data filtering
 */
router.get('/', asyncErrorHandler(async (req, res) => {
  const {
    user_id = null,
    material_id = null,
    scan_method = null,
    start_date = null,
    end_date = null,
    page = 1,
    limit = 10,
    sort = 'created_at',
    order = 'desc'
  } = req.query;
  
  console.log(`📋 Listing scans with filters:`, { user_id, material_id, scan_method });
  
  // Educational Note: Validate user_id if provided
  if (user_id && isNaN(parseInt(user_id))) {
    throw createError.badRequest('User ID must be a valid number');
  }
  
  // TODO: Implement actual database query with filters and authorization
  // For now, return educational mock data
  const mockScans = [
    {
      id: 1,
      user_id: 1,
      material_id: 1,
      scan_method: 'ai_analysis',
      scan_source: 'web_upload',
      image_url: '/uploads/scan-1640995200000-123456789.jpg',
      confidence_score: 0.85,
      points_awarded: 10,
      bonus_points: 5,
      achievement_unlocked: 'first_scan',
      learning_objective: 'plastic_identification',
      difficulty_encountered: 'easy',
      help_used: false,
      location_context: 'home',
      scan_duration_ms: 1250,
      created_at: new Date().toISOString(),
      material: {
        name: 'PET Plastic',
        category: 'plastic',
        recycling_symbol_code: 'PETE'
      },
      user_feedback: 'correct'
    },
    {
      id: 2,
      user_id: 1,
      material_id: null,
      scan_method: 'manual',
      scan_source: 'manual_entry',
      manual_material_name: 'Unknown plastic bottle',
      points_awarded: 5,
      learning_objective: 'material_exploration',
      difficulty_encountered: 'medium',
      help_used: true,
      location_context: 'school',
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      user_feedback: null
    }
  ];
  
  // Educational Note: Apply filters to mock data
  let filteredScans = mockScans;
  
  if (user_id) {
    filteredScans = filteredScans.filter(s => s.user_id === parseInt(user_id));
  }
  
  if (material_id) {
    filteredScans = filteredScans.filter(s => s.material_id === parseInt(material_id));
  }
  
  if (scan_method) {
    filteredScans = filteredScans.filter(s => s.scan_method === scan_method);
  }
  
  res.json({
    success: true,
    data: {
      scans: filteredScans,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total_pages: 1,
        total_count: filteredScans.length
      },
      filters_applied: { user_id, material_id, scan_method, start_date, end_date }
    },
    educational: {
      note: 'This endpoint demonstrates scan history with educational tracking',
      query_parameters: {
        user_id: 'Filter by specific user ID',
        material_id: 'Filter by identified material',
        scan_method: 'Filter by method (ai_analysis, camera, manual)',
        start_date: 'Filter scans after date (ISO format)',
        end_date: 'Filter scans before date (ISO format)'
      }
    }
  });
}));

/**
 * Educational Route: POST /api/scans
 * 
 * Demonstrates new scan creation with image upload and AI analysis
 * Learn about: file upload handling, AI integration, activity logging
 */
router.post('/', upload.single('image'), asyncErrorHandler(async (req, res) => {
  const {
    user_id,
    scan_method = 'ai_analysis',
    learning_objective,
    location_context = 'unknown',
    manual_material_name
  } = req.body;
  
  const scanStartTime = Date.now();
  
  console.log(`📸 Processing new scan:`, { 
    user_id, 
    scan_method, 
    has_image: !!req.file,
    learning_objective 
  });
  
  // Educational Note: Validate required fields
  if (!user_id || isNaN(parseInt(user_id))) {
    throw createError.badRequest('Valid user_id is required');
  }
  
  if (scan_method === 'ai_analysis' && !req.file) {
    throw createError.badRequest('Image file is required for AI analysis scans');
  }
  
  if (scan_method === 'manual' && !manual_material_name) {
    throw createError.badRequest('manual_material_name is required for manual scans');
  }
  
  let scanResult = {
    id: Date.now(), // Mock ID generation
    user_id: parseInt(user_id),
    scan_method,
    scan_source: req.file ? 'web_upload' : 'manual_entry',
    learning_objective: learning_objective || 'general_identification',
    location_context,
    scan_duration_ms: 0, // Will be calculated
    created_at: new Date().toISOString(),
    points_awarded: 0,
    bonus_points: 0
  };
  
  // Educational Note: Handle different scan methods
  if (scan_method === 'ai_analysis' && req.file) {
    // Educational Note: Process uploaded image
    scanResult.image_url = `/uploads/${req.file.filename}`;
    
    // TODO: Implement actual AI analysis using Azure OpenAI Vision
    // For now, simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing time
    
    const mockAIAnalysis = {
      identified_material: {
        id: 1,
        name: 'PET Plastic',
        category: 'plastic',
        recycling_symbol_code: 'PETE',
        scan_points: 10
      },
      confidence_score: 0.87,
      analysis_details: {
        visual_features: [
          'Clear transparent material detected',
          'Bottle-shaped object',
          'Recycling symbol visible in bottom area',
          'No visible contamination'
        ],
        processing_time_ms: 487,
        model_version: 'gpt-4o-vision-2024'
      },
      educational_feedback: {
        difficulty_level: 'easy',
        learning_tips: [
          'Excellent clear image quality!',
          'PET plastic is one of the most recyclable materials',
          'Look for the number 1 in the recycling triangle'
        ],
        next_challenge: 'Try identifying colored PET bottles or different plastic types'
      }
    };
    
    scanResult.material_id = mockAIAnalysis.identified_material.id;
    scanResult.confidence_score = mockAIAnalysis.confidence_score;
    scanResult.image_analysis_result = JSON.stringify(mockAIAnalysis);
    scanResult.points_awarded = mockAIAnalysis.identified_material.scan_points;
    
    // Educational Note: Award bonus points for high confidence
    if (mockAIAnalysis.confidence_score >= 0.8) {
      scanResult.bonus_points = 5;
      scanResult.achievement_unlocked = 'accurate_scanner';
    }
    
  } else if (scan_method === 'manual') {
    // Educational Note: Handle manual material entry
    scanResult.manual_material_name = manual_material_name;
    scanResult.points_awarded = 5; // Lower points for manual entry
    
    // TODO: Attempt to match manual entry to known materials
    const mockManualMatch = {
      suggested_materials: [
        { id: 1, name: 'PET Plastic', similarity: 0.75 },
        { id: 4, name: 'Plastic Bottle (Generic)', similarity: 0.60 }
      ],
      educational_feedback: {
        learning_tip: 'Try using the camera for automatic identification!',
        improvement_suggestion: 'Learning to identify materials helps build recycling knowledge'
      }
    };
    
    scanResult.manual_match_result = JSON.stringify(mockManualMatch);
  }
  
  // Educational Note: Calculate processing time
  scanResult.scan_duration_ms = Date.now() - scanStartTime;
  
  // Educational Note: Determine difficulty based on confidence/method
  if (scanResult.confidence_score >= 0.9) {
    scanResult.difficulty_encountered = 'easy';
  } else if (scanResult.confidence_score >= 0.7) {
    scanResult.difficulty_encountered = 'medium';
  } else {
    scanResult.difficulty_encountered = 'hard';
  }
  
  // TODO: Save scan to database
  // TODO: Update user points and progress
  // TODO: Check for new achievements
  
  res.status(201).json({
    success: true,
    data: { scan: scanResult },
    educational: {
      note: 'Scan processed successfully with AI analysis',
      performance: {
        processing_time: `${scanResult.scan_duration_ms}ms`,
        confidence_level: scanResult.confidence_score ? 
          `${Math.round(scanResult.confidence_score * 100)}%` : 'N/A'
      },
      learning_opportunities: [
        'Review the identified material properties',
        'Check recycling guidelines for this material type',
        'Practice with similar materials to improve skills'
      ]
    }
  });
}));

/**
 * Educational Route: GET /api/scans/:id
 * 
 * Demonstrates detailed scan information retrieval
 * Learn about: detailed activity records, educational analysis
 */
router.get('/:id', asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  
  // Educational Note: Validate ID parameter
  if (!id || isNaN(parseInt(id))) {
    throw createError.badRequest('Scan ID must be a valid number');
  }
  
  const scanId = parseInt(id);
  console.log(`🔍 Fetching detailed scan information for ID: ${scanId}`);
  
  // TODO: Implement actual database query with joins
  // For now, return mock detailed data
  if (scanId === 1) {
    const detailedScan = {
      id: 1,
      user_id: 1,
      material_id: 1,
      scan_method: 'ai_analysis',
      scan_source: 'web_upload',
      image_url: '/uploads/scan-1640995200000-123456789.jpg',
      confidence_score: 0.85,
      points_awarded: 10,
      bonus_points: 5,
      achievement_unlocked: 'first_scan',
      learning_objective: 'plastic_identification',
      difficulty_encountered: 'easy',
      help_used: false,
      location_context: 'home',
      scan_duration_ms: 1250,
      created_at: new Date().toISOString(),
      
      // Educational Note: Related data with joins
      material: {
        id: 1,
        name: 'PET Plastic',
        category: 'plastic',
        recycling_symbol_number: 1,
        recycling_symbol_code: 'PETE',
        is_recyclable: true,
        description: 'Polyethylene Terephthalate - commonly used for water bottles',
        scan_points: 10
      },
      
      user: {
        id: 1,
        username: 'stem_student',
        display_name: 'STEM Learning Student',
        educational_level: 'beginner'
      },
      
      analysis_details: {
        visual_features: [
          'Clear transparent material detected',
          'Bottle-shaped object',
          'Recycling symbol visible in bottom area'
        ],
        confidence_breakdown: {
          shape_recognition: 0.92,
          material_properties: 0.85,
          recycling_symbol: 0.78,
          overall_confidence: 0.85
        },
        alternative_suggestions: [
          { material: 'HDPE Plastic', confidence: 0.15 },
          { material: 'Generic Plastic', confidence: 0.10 }
        ]
      },
      
      educational_context: {
        learning_objectives_met: ['plastic_identification', 'recycling_symbols'],
        skills_practiced: ['visual_recognition', 'environmental_awareness'],
        knowledge_gaps_identified: [],
        recommended_next_steps: [
          'Practice with colored PET bottles',
          'Learn about PET recycling process',
          'Explore other plastic types'
        ]
      }
    };
    
    res.json({
      success: true,
      data: { scan: detailedScan },
      educational: {
        note: 'Detailed scan information with educational analysis',
        learning_insights: [
          'High confidence scan indicates good image quality and lighting',
          'Easy difficulty suggests strong basic identification skills',
          'Ready to progress to more challenging materials'
        ]
      }
    });
    
  } else {
    throw createError.notFound(`Scan with ID ${scanId} not found`);
  }
}));

/**
 * Educational Route: PUT /api/scans/:id/feedback
 * 
 * Demonstrates user feedback collection for AI improvement
 * Learn about: feedback loops, model improvement, user corrections
 */
router.put('/:id/feedback', asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const { feedback, correct_material_id, comments, learning_note } = req.body;
  
  // Educational Note: Validate ID parameter
  if (!id || isNaN(parseInt(id))) {
    throw createError.badRequest('Scan ID must be a valid number');
  }
  
  // Educational Note: Validate feedback value
  const validFeedback = ['correct', 'incorrect', 'partially_correct', 'unsure'];
  if (!feedback || !validFeedback.includes(feedback)) {
    throw createError.badRequest(
      `Feedback must be one of: ${validFeedback.join(', ')}`
    );
  }
  
  const scanId = parseInt(id);
  console.log(`💬 Recording feedback for scan ${scanId}: ${feedback}`);
  
  // TODO: Update scan record with user feedback
  // TODO: Log feedback for AI model improvement
  // TODO: Award points for providing feedback
  
  const feedbackResult = {
    scan_id: scanId,
    feedback,
    correct_material_id: correct_material_id || null,
    comments: comments || null,
    learning_note: learning_note || null,
    feedback_date: new Date().toISOString(),
    points_awarded: 2, // Small reward for providing feedback
    
    educational_impact: {
      model_improvement: 'Feedback helps improve AI accuracy for future users',
      learning_reinforcement: feedback === 'correct' ? 
        'Positive reinforcement strengthens learning' : 
        'Corrections help identify learning opportunities',
      community_contribution: 'Your feedback makes the app better for everyone'
    }
  };
  
  res.json({
    success: true,
    data: { feedback: feedbackResult },
    educational: {
      note: 'Feedback recorded successfully',
      appreciation: 'Thank you for helping improve the educational experience!',
      impact: [
        'Your feedback trains the AI to be more accurate',
        'Corrections help identify common learning challenges',
        'Community feedback makes recycling education better for everyone'
      ]
    }
  });
}));

/**
 * Educational Route: GET /api/scans/stats/user/:userId
 * 
 * Demonstrates user-specific scanning statistics for progress tracking
 * Learn about: analytics, progress visualization, educational metrics
 */
router.get('/stats/user/:userId', asyncErrorHandler(async (req, res) => {
  const { userId } = req.params;
  const { period = '30d' } = req.query; // 7d, 30d, 90d, all
  
  // Educational Note: Validate user ID
  if (!userId || isNaN(parseInt(userId))) {
    throw createError.badRequest('User ID must be a valid number');
  }
  
  const userIdInt = parseInt(userId);
  console.log(`📊 Generating scan statistics for user ${userIdInt} (period: ${period})`);
  
  // TODO: Implement actual database aggregation queries
  // For now, return mock statistics
  const mockStats = {
    user_id: userIdInt,
    period: period,
    generated_at: new Date().toISOString(),
    
    overall: {
      total_scans: 23,
      successful_identifications: 20,
      manual_entries: 3,
      average_confidence: 0.82,
      total_points_earned: 340,
      total_bonus_points: 65
    },
    
    by_method: {
      ai_analysis: { count: 20, average_confidence: 0.85, points: 280 },
      camera: { count: 0, average_confidence: 0, points: 0 },
      manual: { count: 3, points: 15 }
    },
    
    by_material_category: [
      { category: 'plastic', count: 12, success_rate: 0.92, avg_difficulty: 'easy' },
      { category: 'metal', count: 5, success_rate: 0.80, avg_difficulty: 'medium' },
      { category: 'paper', count: 4, success_rate: 0.75, avg_difficulty: 'easy' },
      { category: 'glass', count: 2, success_rate: 1.00, avg_difficulty: 'easy' }
    ],
    
    learning_progress: {
      difficulty_progression: {
        easy: 15,
        medium: 6,
        hard: 2,
        expert: 0
      },
      help_usage_rate: 0.13, // 13% of scans used help
      improvement_trajectory: 'improving', // improving, stable, declining
      knowledge_gaps: ['complex_plastics', 'contaminated_materials']
    },
    
    achievements: [
      { badge: 'first_scan', earned_at: '2024-01-01T10:00:00Z' },
      { badge: 'plastic_master', earned_at: '2024-01-05T14:30:00Z' },
      { badge: 'accurate_scanner', earned_at: '2024-01-08T09:15:00Z' }
    ],
    
    recent_activity: [
      { date: '2024-01-09', scans: 3, points: 35 },
      { date: '2024-01-08', scans: 2, points: 25 },
      { date: '2024-01-07', scans: 1, points: 10 }
    ]
  };
  
  res.json({
    success: true,
    data: { stats: mockStats },
    educational: {
      note: 'User scanning statistics with educational insights',
      insights: [
        `${mockStats.overall.successful_identifications}/${mockStats.overall.total_scans} successful identifications shows strong learning progress`,
        `Average confidence of ${Math.round(mockStats.overall.average_confidence * 100)}% indicates good image quality and recognition skills`,
        'Ready to try more challenging materials and categories'
      ],
      recommendations: [
        'Focus on materials with lower success rates for improvement',
        'Try scanning in different lighting conditions for practice',
        'Explore the material database to learn about new categories'
      ]
    }
  });
}));

// Educational Export: Make router available to main application
module.exports = router;