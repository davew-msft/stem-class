/**
 * Locations Routes for Rescan Educational Project
 * ==============================================
 * 
 * Educational Focus: Learn geographic data handling, location-based services,
 * and community resource management for recycling education.
 * 
 * Key Learning Concepts:
 * - Geographic data storage and queries
 * - Location-based filtering and search
 * - Community resource management
 * - Distance calculations and mapping integration
 * - Educational content about local recycling infrastructure
 */

const express = require('express');
const router = express.Router();

// Educational Note: Import middleware and utilities
const { asyncErrorHandler, createError } = require('../../middleware/errorHandler');

/**
 * Educational Function: Calculate distance between two points
 * 
 * Demonstrates basic geographic calculations for educational purposes
 * Learn about: Haversine formula, coordinate systems, distance measurement
 * 
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point  
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in miles
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  // Educational Note: Haversine formula for great-circle distance
  const R = 3959; // Earth's radius in miles
  
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Educational Route: GET /api/locations
 * 
 * Demonstrates location listing with geographic filtering
 * Learn about: geographic queries, proximity search, location services
 */
router.get('/', asyncErrorHandler(async (req, res) => {
  const {
    type = null,
    city = null,
    state = null,
    zip_code = null,
    latitude = null,
    longitude = null,
    radius = 10, // miles
    materials = null, // comma-separated list
    verified_only = 'false',
    page = 1,
    limit = 20,
    sort = 'name'
  } = req.query;
  
  console.log(`📍 Listing locations with filters:`, { 
    type, city, state, latitude, longitude, radius 
  });
  
  // Educational Note: Validate geographic coordinates if provided
  if (latitude && longitude) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw createError.badRequest('Invalid latitude/longitude coordinates');
    }
  }
  
  // TODO: Implement actual database query with spatial filtering
  // For now, return educational mock data
  const mockLocations = [
    {
      id: 1,
      name: 'Downtown Recycling Center',
      type: 'recycling_center',
      street_address: '123 Green Street',
      city: 'Educational City',
      state: 'Learning State',
      zip_code: '12345',
      country: 'USA',
      latitude: 40.7128,
      longitude: -74.0060,
      phone: '(555) 123-4567',
      email: 'info@downtownrecycling.edu',
      website_url: 'https://downtownrecycling.edu',
      hours_of_operation: {
        'monday': '8:00-17:00',
        'tuesday': '8:00-17:00', 
        'wednesday': '8:00-17:00',
        'thursday': '8:00-17:00',
        'friday': '8:00-17:00',
        'saturday': '9:00-15:00',
        'sunday': 'closed'
      },
      accepted_materials: ['plastic', 'metal', 'paper', 'glass', 'electronic'],
      services_offered: ['drop_off', 'pickup', 'sorting', 'education'],
      accessibility_features: ['wheelchair_accessible', 'parking_available'],
      special_notes: 'Educational tours available for school groups by appointment',
      is_active: true,
      is_verified: true,
      verification_date: '2024-01-01T00:00:00Z',
      distance: null // Will be calculated if lat/lng provided
    },
    {
      id: 2,
      name: 'School District Drop-Off Point',
      type: 'drop_off_point',
      street_address: '456 Education Avenue',
      city: 'Educational City',
      state: 'Learning State', 
      zip_code: '12345',
      country: 'USA',
      latitude: 40.7589,
      longitude: -73.9851,
      phone: '(555) 234-5678',
      website_url: 'https://schooldistrict.edu/recycling',
      hours_of_operation: {
        'all_days': '24/7'
      },
      accepted_materials: ['plastic', 'paper', 'batteries'],
      services_offered: ['drop_off'],
      accessibility_features: ['wheelchair_accessible', '24_hour_access'],
      special_notes: 'Secure drop-off containers available 24/7',
      is_active: true,
      is_verified: true,
      verification_date: '2024-01-01T00:00:00Z',
      distance: null
    },
    {
      id: 3,
      name: 'Community Electronics Recycling',
      type: 'special_event',
      street_address: '789 Community Center Drive',
      city: 'Educational City',
      state: 'Learning State',
      zip_code: '12346',
      country: 'USA',
      latitude: 40.7831,
      longitude: -73.9712,
      phone: '(555) 345-6789',
      hours_of_operation: {
        'event_schedule': 'First Saturday of each month, 9:00-15:00'
      },
      accepted_materials: ['electronic', 'battery'],
      services_offered: ['drop_off', 'data_destruction'],
      special_notes: 'Monthly electronics recycling event. Bring computers, phones, batteries.',
      is_active: true,
      is_verified: false,
      distance: null
    }
  ];
  
  // Educational Note: Apply filters to mock data
  let filteredLocations = mockLocations;
  
  if (type) {
    filteredLocations = filteredLocations.filter(loc => loc.type === type);
  }
  
  if (city) {
    filteredLocations = filteredLocations.filter(loc => 
      loc.city.toLowerCase().includes(city.toLowerCase())
    );
  }
  
  if (state) {
    filteredLocations = filteredLocations.filter(loc => 
      loc.state.toLowerCase().includes(state.toLowerCase())
    );
  }
  
  if (verified_only === 'true') {
    filteredLocations = filteredLocations.filter(loc => loc.is_verified);
  }
  
  if (materials) {
    const materialList = materials.split(',').map(m => m.trim());
    filteredLocations = filteredLocations.filter(loc =>
      materialList.some(material => loc.accepted_materials.includes(material))
    );
  }
  
  // Educational Note: Calculate distances if coordinates provided
  if (latitude && longitude) {
    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);
    const radiusNum = parseFloat(radius);
    
    filteredLocations = filteredLocations.map(loc => ({
      ...loc,
      distance: calculateDistance(userLat, userLng, loc.latitude, loc.longitude)
    })).filter(loc => loc.distance <= radiusNum)
      .sort((a, b) => a.distance - b.distance); // Sort by distance
  }
  
  res.json({
    success: true,
    data: {
      locations: filteredLocations,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total_pages: 1,
        total_count: filteredLocations.length
      },
      filters_applied: { 
        type, city, state, materials, verified_only,
        search_center: latitude && longitude ? { latitude, longitude } : null,
        search_radius: `${radius} miles`
      }
    },
    educational: {
      note: 'Recycling location directory with geographic filtering',
      query_parameters: {
        latitude: 'Your latitude for proximity search',
        longitude: 'Your longitude for proximity search', 
        radius: 'Search radius in miles (default: 10)',
        type: 'Filter by location type',
        materials: 'Comma-separated list of accepted materials',
        verified_only: 'true/false - show only verified locations'
      },
      available_types: [
        'recycling_center', 'drop_off_point', 'collection_site', 
        'curbside_pickup', 'special_event'
      ]
    }
  });
}));

/**
 * Educational Route: GET /api/locations/:id
 * 
 * Demonstrates detailed location information retrieval
 * Learn about: detailed resource representation, operational information
 */
router.get('/:id', asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  
  // Educational Note: Validate ID parameter
  if (!id || isNaN(parseInt(id))) {
    throw createError.badRequest('Location ID must be a valid number');
  }
  
  const locationId = parseInt(id);
  console.log(`📍 Fetching detailed location information for ID: ${locationId}`);
  
  // TODO: Implement actual database query
  // For now, return mock detailed data
  if (locationId === 1) {
    const detailedLocation = {
      id: 1,
      name: 'Downtown Recycling Center',
      type: 'recycling_center',
      description: 'Full-service recycling center serving the educational community with comprehensive material acceptance and educational programs.',
      
      // Address and contact
      street_address: '123 Green Street',
      city: 'Educational City',
      state: 'Learning State',
      zip_code: '12345',
      country: 'USA', 
      latitude: 40.7128,
      longitude: -74.0060,
      
      // Contact information
      phone: '(555) 123-4567',
      email: 'info@downtownrecycling.edu',
      website_url: 'https://downtownrecycling.edu',
      
      // Operational details
      hours_of_operation: {
        'monday': '8:00-17:00',
        'tuesday': '8:00-17:00',
        'wednesday': '8:00-17:00', 
        'thursday': '8:00-17:00',
        'friday': '8:00-17:00',
        'saturday': '9:00-15:00',
        'sunday': 'closed'
      },
      
      // Accepted materials with details
      accepted_materials_detailed: [
        { 
          category: 'plastic',
          types: ['PET', 'HDPE', 'PP'], 
          notes: 'Clean containers only, no caps',
          processing_fee: '$0.00'
        },
        {
          category: 'metal',
          types: ['aluminum', 'steel', 'copper'],
          notes: 'No mixed metals, separate by type',
          processing_fee: '$0.00'
        },
        {
          category: 'paper',
          types: ['cardboard', 'newspaper', 'magazines'],
          notes: 'Dry materials only, no wax coating',
          processing_fee: '$0.00'
        },
        {
          category: 'glass',
          types: ['clear', 'brown', 'green'],
          notes: 'Separate by color, no broken glass',
          processing_fee: '$0.00'
        },
        {
          category: 'electronic',
          types: ['computers', 'phones', 'batteries'],
          notes: 'Data destruction available',
          processing_fee: '$5.00 per item'
        }
      ],
      
      // Services and features
      services_offered: ['drop_off', 'pickup', 'sorting', 'education'],
      service_details: {
        drop_off: 'Self-service drop-off stations available during operating hours',
        pickup: 'Scheduled pickup available for large quantities (call ahead)',
        sorting: 'On-site sorting assistance for educational groups',
        education: 'Guided tours and recycling workshops for schools'
      },
      
      accessibility_features: ['wheelchair_accessible', 'parking_available', 'loading_dock'],
      
      // Educational programs
      educational_programs: [
        {
          name: 'School Tour Program',
          description: 'Guided tours showing recycling process from collection to processing',
          duration: '45 minutes',
          group_size: '10-30 students',
          age_range: 'K-12',
          booking_required: true
        },
        {
          name: 'Recycling Workshop',
          description: 'Hands-on workshop teaching sorting and identification skills', 
          duration: '90 minutes',
          group_size: '8-20 students',
          age_range: '3rd grade and up',
          booking_required: true
        }
      ],
      
      // Status and verification
      is_active: true,
      is_verified: true,
      verification_date: '2024-01-01T00:00:00Z',
      last_verified: '2024-01-15T00:00:00Z',
      
      // Operational statistics
      statistics: {
        monthly_volume_tons: 45.2,
        materials_processed: ['plastic', 'metal', 'paper', 'glass', 'electronic'],
        diversion_rate: 0.87, // 87% diverted from landfill
        educational_visitors_monthly: 156
      },
      
      // Timestamps
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    };
    
    res.json({
      success: true,
      data: { location: detailedLocation },
      educational: {
        note: 'Detailed recycling location with educational programs',
        visit_preparation: [
          'Check current hours of operation',
          'Review accepted materials list',
          'Sort materials by category before visiting',
          'Consider booking educational tour if visiting with group'
        ],
        learning_opportunities: [
          'Observe recycling sorting process',
          'Learn about different material processing methods', 
          'Understand local recycling infrastructure',
          'Practice material identification skills'
        ]
      }
    });
    
  } else {
    throw createError.notFound(`Location with ID ${locationId} not found`);
  }
}));

/**
 * Educational Route: POST /api/locations
 * 
 * Demonstrates community location submission for educational participation
 * Learn about: user-generated content, data validation, community engagement
 */
router.post('/', asyncErrorHandler(async (req, res) => {
  const {
    name,
    type,
    street_address,
    city,
    state,
    zip_code,
    phone,
    website_url,
    accepted_materials = [],
    hours_of_operation,
    special_notes,
    submitted_by_user_id
  } = req.body;
  
  console.log(`📝 New location submission: ${name} in ${city}, ${state}`);
  
  // Educational Note: Validate required fields
  if (!name || name.trim().length === 0) {
    throw createError.badRequest('Location name is required');
  }
  
  if (!type) {
    throw createError.badRequest('Location type is required');
  }
  
  const validTypes = ['recycling_center', 'drop_off_point', 'collection_site', 'curbside_pickup', 'special_event'];
  if (!validTypes.includes(type)) {
    throw createError.badRequest(`Location type must be one of: ${validTypes.join(', ')}`);
  }
  
  if (!city || !state) {
    throw createError.badRequest('City and state are required');
  }
  
  // Educational Note: Validate materials list
  const validMaterials = ['plastic', 'paper', 'metal', 'glass', 'fabric', 'electronic', 'battery', 'organic', 'hazardous'];
  const invalidMaterials = accepted_materials.filter(m => !validMaterials.includes(m));
  
  if (invalidMaterials.length > 0) {
    throw createError.badRequest(
      `Invalid materials: ${invalidMaterials.join(', ')}. Valid options: ${validMaterials.join(', ')}`
    );
  }
  
  // TODO: Validate address using geocoding service
  // TODO: Check for duplicate locations
  // TODO: Insert into database with is_verified = false
  
  // Educational Note: Mock successful submission
  const newLocation = {
    id: Date.now(), // Mock ID generation
    name,
    type,
    street_address: street_address || null,
    city,
    state,
    zip_code: zip_code || null,
    country: 'USA',
    phone: phone || null,
    website_url: website_url || null,
    hours_of_operation: hours_of_operation || null,
    accepted_materials,
    special_notes: special_notes || null,
    submitted_by_user_id: submitted_by_user_id || null,
    
    // Status flags
    is_active: true,
    is_verified: false, // All submissions start unverified
    verification_date: null,
    
    // Timestamps
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  res.status(201).json({
    success: true,
    data: { location: newLocation },
    educational: {
      note: 'Location submission received for community review',
      next_steps: [
        'Your submission will be reviewed by community moderators',
        'Verified locations help build the recycling knowledge base',
        'Thank you for contributing to environmental education!'
      ],
      verification_process: [
        'Community moderators will verify the information',
        'Location details may be updated during verification',
        'Verified locations become available to all users'
      ]
    }
  });
}));

/**
 * Educational Route: GET /api/locations/search/nearby
 * 
 * Demonstrates proximity-based location search
 * Learn about: geographic algorithms, spatial queries, user location services
 */
router.get('/search/nearby', asyncErrorHandler(async (req, res) => {
  const {
    latitude,
    longitude,
    radius = 5, // miles
    materials = null,
    type = null,
    limit = 10
  } = req.query;
  
  // Educational Note: Validate required coordinates
  if (!latitude || !longitude) {
    throw createError.badRequest('Latitude and longitude are required for proximity search');
  }
  
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw createError.badRequest('Invalid latitude/longitude coordinates');
  }
  
  console.log(`📍 Searching for nearby locations around ${lat}, ${lng} within ${radius} miles`);
  
  // TODO: Implement spatial database query
  // For now, use mock data with distance calculations
  const allLocations = [
    { id: 1, name: 'Downtown Recycling Center', latitude: 40.7128, longitude: -74.0060, type: 'recycling_center', accepted_materials: ['plastic', 'metal', 'paper'] },
    { id: 2, name: 'School District Drop-Off', latitude: 40.7589, longitude: -73.9851, type: 'drop_off_point', accepted_materials: ['plastic', 'paper'] },
    { id: 3, name: 'Community Electronics Event', latitude: 40.7831, longitude: -73.9712, type: 'special_event', accepted_materials: ['electronic'] }
  ];
  
  // Calculate distances and filter by radius
  const nearbyLocations = allLocations
    .map(loc => ({
      ...loc,
      distance: calculateDistance(lat, lng, loc.latitude, loc.longitude)
    }))
    .filter(loc => loc.distance <= parseFloat(radius))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, parseInt(limit));
  
  // Apply additional filters
  let filteredLocations = nearbyLocations;
  
  if (type) {
    filteredLocations = filteredLocations.filter(loc => loc.type === type);
  }
  
  if (materials) {
    const materialList = materials.split(',').map(m => m.trim());
    filteredLocations = filteredLocations.filter(loc =>
      materialList.some(material => loc.accepted_materials.includes(material))
    );
  }
  
  res.json({
    success: true,
    data: {
      search_center: { latitude: lat, longitude: lng },
      search_radius: `${radius} miles`,
      locations: filteredLocations,
      result_count: filteredLocations.length
    },
    educational: {
      note: 'Proximity-based location search with distance calculations',
      geographic_learning: [
        'Distance calculated using Haversine formula for great-circle distance',
        'Locations sorted by proximity to your position',
        'Geographic coordinates use WGS84 decimal degrees format'
      ],
      privacy_note: 'Location data is used only for search - not stored or tracked'
    }
  });
}));

/**
 * Educational Route: GET /api/locations/types
 * 
 * Demonstrates location type reference data
 * Learn about: reference data patterns, categorization systems
 */
router.get('/types', asyncErrorHandler(async (req, res) => {
  console.log('📂 Fetching location type reference data');
  
  const locationTypes = [
    {
      type: 'recycling_center',
      display_name: 'Recycling Center',
      description: 'Full-service facility accepting multiple material types',
      typical_materials: ['plastic', 'metal', 'paper', 'glass', 'electronic'],
      typical_services: ['drop_off', 'pickup', 'sorting', 'education'],
      educational_value: 'High - often offers tours and educational programs'
    },
    {
      type: 'drop_off_point', 
      display_name: 'Drop-Off Point',
      description: 'Convenient location for depositing recyclable materials',
      typical_materials: ['plastic', 'paper', 'metal', 'batteries'],
      typical_services: ['drop_off'],
      educational_value: 'Medium - good for practicing sorting skills'
    },
    {
      type: 'collection_site',
      display_name: 'Collection Site',
      description: 'Temporary or periodic collection location',
      typical_materials: ['varies by event'],
      typical_services: ['drop_off'],
      educational_value: 'Medium - learn about collection logistics'
    },
    {
      type: 'curbside_pickup',
      display_name: 'Curbside Pickup Service',
      description: 'Home pickup service for residential recycling',
      typical_materials: ['plastic', 'paper', 'metal', 'glass'],
      typical_services: ['pickup'],
      educational_value: 'Low - limited interaction but shows system integration'
    },
    {
      type: 'special_event',
      display_name: 'Special Recycling Event', 
      description: 'Periodic events for hard-to-recycle materials',
      typical_materials: ['electronic', 'battery', 'hazardous', 'textile'],
      typical_services: ['drop_off', 'education'],
      educational_value: 'High - specialized learning about problem materials'
    }
  ];
  
  res.json({
    success: true,
    data: { location_types: locationTypes },
    educational: {
      note: 'Location type reference with educational context',
      learning_progression: [
        '1. Start with drop-off points to practice material identification',
        '2. Visit recycling centers for comprehensive education',
        '3. Attend special events to learn about challenging materials',
        '4. Understand how different locations fit into recycling system'
      ]
    }
  });
}));

// Educational Export: Make router available to main application
module.exports = router;