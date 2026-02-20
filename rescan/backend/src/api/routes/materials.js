/**
 * Materials Routes for Rescan Educational Project
 * ==============================================
 * 
 * Educational Focus: Learn RESTful API design for reference data,
 * search functionality, and educational content delivery.
 * 
 * Key Learning Concepts:
 * - Reference data API patterns
 * - Search and filtering endpoints
 * - Educational content organization
 * - Query optimization for lookups
 * - Caching strategies for static data
 */

const express = require('express');
const router = express.Router();

// Educational Note: Import middleware and utilities
const { asyncErrorHandler, createError } = require('../../middleware/errorHandler');

/**
 * Educational Route: GET /api/materials
 * 
 * Demonstrates reference data listing with search and filtering
 * Learn about: query parameters, search implementation, data filtering
 */
router.get('/', asyncErrorHandler(async (req, res) => {
  const {
    category = null,
    recyclable = null,
    search = null,
    difficulty = null,
    page = 1,
    limit = 20,
    sort = 'name'
  } = req.query;
  
  console.log(`📋 Listing materials with filters:`, { category, recyclable, search, difficulty });
  
  // TODO: Implement actual database query with SQLite search
  // For now, return educational mock data
  const mockMaterials = [
    {
      id: 1,
      name: 'PET Plastic',
      category: 'plastic',
      recycling_symbol_number: 1,
      recycling_symbol_code: 'PETE',
      is_recyclable: true,
      description: 'Polyethylene Terephthalate - commonly used for water bottles and food containers',
      recycling_process: 'Clean bottles are sorted, chopped into flakes, melted and reformed into new products',
      environmental_impact: 'Can take 400+ years to decompose naturally. Recycling saves 60% energy vs new production.',
      scan_points: 10,
      difficulty_level: 'easy',
      common_examples: ['water bottles', 'soda bottles', 'food containers'],
      color_variations: ['clear', 'blue', 'green'],
      texture_description: 'Smooth, lightweight plastic that crackles when squeezed',
      fun_facts: [
        'One recycled PET bottle saves enough energy to power a 60W light bulb for 6 hours',
        'PET bottles can be recycled into clothing, carpets, and new bottles'
      ]
    },
    {
      id: 2,
      name: 'Aluminum Can',
      category: 'metal',
      recycling_symbol_number: null,
      recycling_symbol_code: 'ALU',
      is_recyclable: true,
      description: 'Aluminum cans are infinitely recyclable and save significant energy when recycled',
      recycling_process: 'Cans are shredded, melted and reformed. Can become new can in 60 days.',
      environmental_impact: 'Recycling aluminum uses 95% less energy than producing from raw materials.',
      scan_points: 20,
      difficulty_level: 'easy',
      common_examples: ['soda cans', 'beer cans', 'energy drink cans'],
      color_variations: ['silver', 'red', 'blue', 'green'],
      texture_description: 'Smooth metal surface, lightweight but sturdy',
      fun_facts: [
        'Aluminum can be recycled infinitely without losing quality',
        'Americans throw away enough aluminum to rebuild the entire commercial fleet every 3 months'
      ]
    },
    {
      id: 3,
      name: 'Polystyrene (Styrofoam)',
      category: 'plastic',
      recycling_symbol_number: 6,
      recycling_symbol_code: 'PS',
      is_recyclable: false,
      description: 'Polystyrene foam, commonly called Styrofoam, is difficult to recycle and often not accepted',
      recycling_process: 'Limited recycling facilities exist. Often must be taken to special collection points.',
      environmental_impact: 'Takes 500+ years to decompose. Often breaks into small pieces that harm marine life.',
      scan_points: 30,
      difficulty_level: 'hard',
      common_examples: ['takeout containers', 'coffee cups', 'packaging materials'],
      color_variations: ['white', 'yellow', 'pink'],
      texture_description: 'Light, foamy texture that breaks easily into small pieces',
      fun_facts: [
        'Styrofoam is 95% air',
        'Americans throw away 25 billion Styrofoam cups every year'
      ]
    }
  ];
  
  // Educational Note: Apply filters to mock data
  let filteredMaterials = mockMaterials;
  
  if (category) {
    filteredMaterials = filteredMaterials.filter(m => m.category === category);
  }
  
  if (recyclable !== null) {
    const isRecyclable = recyclable === 'true';
    filteredMaterials = filteredMaterials.filter(m => m.is_recyclable === isRecyclable);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredMaterials = filteredMaterials.filter(m => 
      m.name.toLowerCase().includes(searchLower) ||
      m.description.toLowerCase().includes(searchLower) ||
      m.common_examples.some(example => example.toLowerCase().includes(searchLower))
    );
  }
  
  if (difficulty) {
    filteredMaterials = filteredMaterials.filter(m => m.difficulty_level === difficulty);
  }
  
  res.json({
    success: true,
    data: {
      materials: filteredMaterials,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total_pages: 1,
        total_count: filteredMaterials.length
      },
      filters_applied: { category, recyclable, search, difficulty }
    },
    educational: {
      note: 'This endpoint demonstrates material database with filtering',
      available_categories: ['plastic', 'paper', 'metal', 'glass', 'fabric', 'electronic', 'battery'],
      query_parameters: {
        category: 'Filter by material category',
        recyclable: 'true/false - filter by recyclability',
        search: 'Search in name, description, and examples',
        difficulty: 'Filter by identification difficulty (easy, medium, hard)',
        sort: 'Sort by field (name, category, scan_points)'
      }
    }
  });
}));

/**
 * Educational Route: GET /api/materials/:id
 * 
 * Demonstrates detailed material information retrieval
 * Learn about: detailed resource representation, educational content structure
 */
router.get('/:id', asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  
  // Educational Note: Validate ID parameter
  if (!id || isNaN(parseInt(id))) {
    throw createError.badRequest('Material ID must be a valid number');
  }
  
  const materialId = parseInt(id);
  console.log(`🔍 Fetching material with ID: ${materialId}`);
  
  // TODO: Implement actual database query
  // For now, return mock data or 404
  const mockMaterials = {
    1: {
      id: 1,
      name: 'PET Plastic',
      category: 'plastic',
      recycling_symbol_number: 1,
      recycling_symbol_code: 'PETE',
      is_recyclable: true,
      description: 'Polyethylene Terephthalate - commonly used for water bottles and food containers',
      recycling_process: 'Clean bottles are sorted by color, chopped into flakes, washed, melted and reformed into new products. The entire process can be completed in facilities using automated sorting systems.',
      environmental_impact: 'Can take 400+ years to decompose naturally. Recycling saves 60% energy vs new production. One ton of recycled PET saves 2,000 pounds of carbon dioxide from entering atmosphere.',
      scan_points: 10,
      difficulty_level: 'easy',
      common_examples: ['water bottles', 'soda bottles', 'food containers', 'mouthwash bottles'],
      color_variations: ['clear', 'blue', 'green', 'brown'],
      texture_description: 'Smooth, lightweight plastic that crackles when squeezed. Often has visible seams from molding process.',
      fun_facts: [
        'One recycled PET bottle saves enough energy to power a 60W light bulb for 6 hours',
        'PET bottles can be recycled into clothing, carpets, and new bottles',
        'It takes 25 two-liter bottles to make one fleece jacket',
        'PET is the most recycled plastic in the world'
      ],
      identification_tips: [
        'Look for the number 1 inside the recycling symbol',
        'Usually clear or lightly tinted',
        'Makes a crackling sound when squeezed',
        'Often used for beverages and personal care products'
      ],
      recycling_guidelines: [
        'Empty all contents completely', 
        'Rinse if food residue is present',
        'Remove caps and labels (these are often different plastic types)',
        'Crushing lengthwise saves space but is not required'
      ],
      educational_activities: [
        'Compare transparency of different plastic types',
        'Practice identifying recycling symbols',
        'Research local PET recycling facilities'
      ],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  };
  
  const material = mockMaterials[materialId];
  
  if (material) {
    res.json({
      success: true,
      data: { material },
      educational: {
        note: 'Detailed material information with educational content',
        learning_objectives: [
          'Understand material properties and composition',
          'Learn proper recycling procedures',
          'Recognize environmental impact factors',
          'Develop identification skills'
        ]
      }
    });
  } else {
    throw createError.notFound(`Material with ID ${materialId} not found`);
  }
}));

/**
 * Educational Route: POST /api/materials/identify
 * 
 * Demonstrates material identification from image or description
 * Learn about: AI integration, image processing, confidence scoring
 */
router.post('/identify', asyncErrorHandler(async (req, res) => {
  const { image_url, description, user_input, context } = req.body;
  
  console.log(`🔍 Material identification request:`, { 
    has_image: !!image_url, 
    has_description: !!description,
    context 
  });
  
  // Educational Note: Validate input
  if (!image_url && !description && !user_input) {
    throw createError.badRequest(
      'Material identification requires either image_url, description, or user_input'
    );
  }
  
  // TODO: Implement AI image analysis using Azure OpenAI
  // TODO: Implement text-based material matching
  
  // Educational Note: Mock AI response for demonstration
  const mockIdentification = {
    identified_material: {
      id: 1,
      name: 'PET Plastic',
      category: 'plastic',
      recycling_symbol_code: 'PETE',
      is_recyclable: true,
      scan_points: 10
    },
    confidence_score: 0.85,
    alternative_matches: [
      {
        id: 2,
        name: 'HDPE Plastic',
        confidence: 0.15
      }
    ],
    analysis_details: {
      visual_features: image_url ? [
        'Clear/transparent appearance',
        'Bottle-like shape detected',
        'Visible recycling symbol area'
      ] : null,
      text_analysis: description ? [
        'Keywords matched: bottle, clear, plastic',
        'Context suggests beverage container'
      ] : null,
      processing_time_ms: 234
    },
    educational_feedback: {
      learning_tip: 'Great identification! PET plastics are among the most commonly recycled materials.',
      next_challenge: 'Try identifying different colored PET bottles or other plastic types',
      difficulty_assessment: 'This was an easy identification - you\'re ready for more challenging materials!'
    }
  };
  
  res.json({
    success: true,
    data: mockIdentification,
    educational: {
      note: 'This endpoint demonstrates AI-powered material identification',
      features: [
        'Image analysis using computer vision',
        'Text-based material matching',
        'Confidence scoring for reliability',
        'Alternative suggestions for learning'
      ],
      tips: [
        'Good lighting improves image identification accuracy',
        'Multiple angles can help with difficult materials',
        'Context clues (location, use) help narrow possibilities'
      ]
    }
  });
}));

/**
 * Educational Route: GET /api/materials/categories
 * 
 * Demonstrates category listing for navigation and filtering
 * Learn about: reference data organization, hierarchical data
 */
router.get('/categories', asyncErrorHandler(async (req, res) => {
  console.log('📂 Fetching material categories');
  
  // TODO: Implement dynamic category fetching from database
  
  const categories = [
    {
      name: 'plastic',
      display_name: 'Plastics',
      description: 'Polymer-based materials with recycling symbols 1-7',
      material_count: 15,
      difficulty_distribution: { easy: 8, medium: 5, hard: 2 },
      common_recycling_symbols: [1, 2, 3, 4, 5, 6, 7],
      educational_focus: 'Understanding plastic types and recycling codes'
    },
    {
      name: 'metal',
      display_name: 'Metals',
      description: 'Aluminum, steel, and other metallic materials',
      material_count: 8,
      difficulty_distribution: { easy: 5, medium: 2, hard: 1 },
      common_recycling_symbols: [],
      educational_focus: 'Learning about metal properties and infinite recyclability'
    },
    {
      name: 'paper',
      display_name: 'Paper & Cardboard',
      description: 'Paper products, cardboard, and paperboard materials',
      material_count: 12,
      difficulty_distribution: { easy: 8, medium: 3, hard: 1 },
      common_recycling_symbols: [],
      educational_focus: 'Understanding paper grades and contamination issues'
    },
    {
      name: 'glass',
      display_name: 'Glass',
      description: 'Glass bottles, jars, and containers',
      material_count: 6,
      difficulty_distribution: { easy: 4, medium: 2, hard: 0 },
      common_recycling_symbols: [],
      educational_focus: 'Color separation and infinite recyclability of glass'
    }
  ];
  
  res.json({
    success: true,
    data: { 
      categories,
      summary: {
        total_categories: categories.length,
        total_materials: categories.reduce((sum, cat) => sum + cat.material_count, 0),
        difficulty_summary: categories.reduce((acc, cat) => {
          acc.easy += cat.difficulty_distribution.easy;
          acc.medium += cat.difficulty_distribution.medium;
          acc.hard += cat.difficulty_distribution.hard;
          return acc;
        }, { easy: 0, medium: 0, hard: 0 })
      }
    },
    educational: {
      note: 'Material categories with educational metadata',
      learning_path: [
        '1. Start with easy materials in familiar categories',
        '2. Practice identifying recycling symbols and codes',
        '3. Learn about material properties and recycling processes',
        '4. Progress to more challenging materials and edge cases'
      ]
    }
  });
}));

/**
 * Educational Route: GET /api/materials/search
 * 
 * Demonstrates advanced search functionality
 * Learn about: full-text search, autocomplete, search ranking
 */
router.get('/search', asyncErrorHandler(async (req, res) => {
  const { q, limit = 10, include_examples = false } = req.query;
  
  if (!q || q.trim().length === 0) {
    throw createError.badRequest('Search query (q) parameter is required');
  }
  
  const query = q.trim().toLowerCase();
  console.log(`🔍 Searching materials for: "${query}"`);
  
  // TODO: Implement full-text search with SQLite FTS
  
  // Educational Note: Mock search results with ranking
  const mockSearchResults = [
    {
      id: 1,
      name: 'PET Plastic',
      category: 'plastic',
      match_type: 'name',
      match_score: 0.95,
      snippet: 'PET Plastic - commonly used for water bottles...'
    },
    {
      id: 4,
      name: 'Plastic Bags',
      category: 'plastic', 
      match_type: 'category',
      match_score: 0.75,
      snippet: 'Plastic shopping bags require special recycling...'
    }
  ].filter(result => 
    result.name.toLowerCase().includes(query) ||
    result.category.toLowerCase().includes(query)
  );
  
  res.json({
    success: true,
    data: {
      query: q,
      results: mockSearchResults,
      result_count: mockSearchResults.length,
      search_suggestions: [
        'bottle',
        'aluminum',
        'cardboard',
        'glass jar'
      ]
    },
    educational: {
      note: 'Advanced search with ranking and suggestions',
      search_tips: [
        'Use common names (bottle vs PET)',
        'Try category names (plastic, metal, paper)',
        'Include brand names or product types',
        'Use descriptive words (clear, colored, foam)'
      ]
    }
  });
}));

// Educational Export: Make router available to main application
module.exports = router;