/**
 * CORS Configuration Middleware for Rescan Educational Project
 * ===========================================================
 * 
 * Educational Focus: Learn Cross-Origin Resource Sharing (CORS) concepts,
 * security implications, and configuration for educational development.
 * 
 * Key Learning Concepts:
 * - What CORS is and why browsers enforce it
 * - Origins, methods, and headers in CORS
 * - Development vs production CORS policies
 * - Preflight requests and how they work
 * - Security considerations with CORS
 */

/**
 * Educational Function: CORS Configuration Factory
 * 
 * Creates CORS configuration objects based on environment and educational needs.
 * This demonstrates how to configure CORS for different scenarios.
 * 
 * @param {string} environment - Environment type ('development', 'production', 'test')
 * @returns {Object} CORS configuration object
 */
function createCorsConfig(environment = 'development') {
  // Educational Note: Define allowed origins based on environment
  const allowedOrigins = {
    development: [
      'http://localhost:3000',    // Frontend development server
      'http://127.0.0.1:3000',    // Alternative localhost
      'http://localhost:5500',    // Live Server extension (VS Code)
      'http://127.0.0.1:5500',    // Live Server alternative
      'http://localhost:8080',    // Common development port
      'http://localhost:8000',    // Python simple server
      'null'                      // Local file:// protocol for testing
    ],
    production: [
      'https://your-domain.com',
      'https://www.your-domain.com',
      // Add your production frontend URLs here
    ],
    test: [
      'http://localhost:3000',
      'http://localhost:5500'
    ]
  };
  
  // Educational Note: Define allowed HTTP methods
  const allowedMethods = [
    'GET',      // Read data
    'POST',     // Create new data
    'PUT',      // Update entire resource
    'PATCH',    // Update partial resource
    'DELETE',   // Remove data
    'OPTIONS'   // Preflight requests
  ];
  
  // Educational Note: Define allowed headers
  const allowedHeaders = [
    'Origin',           // Request origin
    'X-Requested-With', // AJAX requests
    'Content-Type',     // Data format (application/json, etc.)
    'Accept',          // Response format preferences
    'Authorization',   // Authentication tokens
    'X-Educational-Mode', // Custom header for educational features
    'X-Request-ID'     // Request tracking
  ];
  
  // Educational Note: Define exposed headers (what browser can access)
  const exposedHeaders = [
    'X-Total-Count',     // Pagination info
    'X-Educational-Tip', // Educational hints
    'X-Response-Time',   // Performance info
    'Location'           // Created resource location
  ];
  
  return {
    // Educational Note: Origin validation function
    origin: function (origin, callback) {
      console.log(`🌐 CORS Check: Origin "${origin}" requesting access...`);
      
      const origins = allowedOrigins[environment] || allowedOrigins.development;
      
      // Educational Note: Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin) {
        console.log('✅ CORS: Allowing request with no origin (mobile/desktop app, Postman, etc.)');
        return callback(null, true);
      }
      
      // Educational Note: Check if origin is in allowed list
      if (origins.includes(origin) || origins.includes('*')) {
        console.log(`✅ CORS: Origin "${origin}" is allowed`);
        callback(null, true);
      } else {
        console.warn(`❌ CORS: Origin "${origin}" is NOT allowed`);
        console.warn(`📚 Educational Note: Add "${origin}" to allowedOrigins.${environment} to fix this`);
        
        const error = new Error(`CORS Error: Origin "${origin}" is not allowed by CORS policy`);
        error.educational = {
          fix: `Add "${origin}" to the allowedOrigins.${environment} array in cors.js`,
          documentation: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS'
        };
        
        callback(error, false);
      }
    },
    
    // Educational Note: Allowed HTTP methods
    methods: allowedMethods,
    
    // Educational Note: Allowed request headers
    allowedHeaders: allowedHeaders,
    
    // Educational Note: Headers that browser can access in response
    exposedHeaders: exposedHeaders,
    
    // Educational Note: Allow cookies and credentials
    credentials: true,
    
    // Educational Note: Preflight cache duration (in seconds)
    maxAge: environment === 'production' ? 86400 : 300, // 24h prod, 5min dev
    
    // Educational Note: Handle preflight success status
    optionsSuccessStatus: 200, // Support legacy browsers
    
    // Educational Note: Continue to next middleware on successful preflight
    preflightContinue: false
  };
}

/**
 * Educational Middleware: CORS Logger
 * 
 * Logs CORS requests for educational understanding
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function corsLogger(req, res, next) {
  // Educational Note: Log CORS-related information
  if (req.method === 'OPTIONS') {
    console.log('🔍 CORS Preflight Request:');
    console.log(`   Origin: ${req.get('Origin')}`);
    console.log(`   Method: ${req.get('Access-Control-Request-Method')}`);
    console.log(`   Headers: ${req.get('Access-Control-Request-Headers')}`);
  }
  
  // Educational Note: Log CORS headers in response
  const originalSend = res.send;
  res.send = function(data) {
    if (process.env.EDUCATIONAL_MODE === 'true') {
      console.log('📤 CORS Response Headers:');
      console.log(`   Access-Control-Allow-Origin: ${res.get('Access-Control-Allow-Origin')}`);
      console.log(`   Access-Control-Allow-Methods: ${res.get('Access-Control-Allow-Methods')}`);
      console.log(`   Access-Control-Allow-Headers: ${res.get('Access-Control-Allow-Headers')}`);
      console.log(`   Access-Control-Allow-Credentials: ${res.get('Access-Control-Allow-Credentials')}`);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
}

/**
 * Educational Function: Create development-friendly CORS
 * 
 * Creates a very permissive CORS configuration for educational development
 * WARNING: Never use this in production!
 * 
 * @returns {Object} Permissive CORS configuration
 */
function createDevelopmentCors() {
  console.log('🚧 WARNING: Using development CORS (very permissive!)');
  console.log('📚 Educational Note: This allows ALL origins - never use in production!');
  
  return {
    origin: true,  // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: '*',
    credentials: true,
    optionsSuccessStatus: 200
  };
}

/**
 * Educational Function: Create production CORS
 * 
 * Creates a strict CORS configuration for production environments
 * 
 * @param {string[]} allowedDomains - Explicitly allowed production domains
 * @returns {Object} Strict CORS configuration
 */
function createProductionCors(allowedDomains = []) {
  console.log('🔒 Using production CORS (strict security)');
  
  return {
    origin: allowedDomains,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With'
    ],
    exposedHeaders: ['X-Total-Count'],
    credentials: true,
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200
  };
}

/**
 * Educational Middleware: Security Headers
 * 
 * Adds additional security headers that work with CORS
 * Demonstrates web security best practices
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function securityHeaders(req, res, next) {
  // Educational Note: Security headers for educational learning
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Frame options (prevent clickjacking)
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Educational header
  res.setHeader('X-Educational-Project', 'Rescan-STEM-Learning');
  
  // Educational Note: Log security headers in development
  if (process.env.EDUCATIONAL_MODE === 'true') {
    console.log('🛡️ Security headers added to response');
  }
  
  next();
}

/**
 * Educational Function: Get CORS middleware for environment
 * 
 * Returns appropriate CORS middleware based on environment
 * 
 * @param {string} environment - Environment name
 * @returns {Function} CORS middleware function
 */
function getCorsMiddleware(environment = process.env.NODE_ENV || 'development') {
  const cors = require('cors');
  
  let corsOptions;
  
  switch (environment) {
    case 'development':
      corsOptions = createCorsConfig('development');
      break;
    case 'test':
      corsOptions = createCorsConfig('test');
      break;
    case 'production':
      corsOptions = createCorsConfig('production');
      break;
    default:
      corsOptions = createDevelopmentCors();
  }
  
  console.log(`🌐 CORS configured for ${environment} environment`);
  
  return cors(corsOptions);
}

// Educational Export: Make CORS utilities available
module.exports = {
  createCorsConfig,
  createDevelopmentCors,
  createProductionCors,
  getCorsMiddleware,
  corsLogger,
  securityHeaders,
  
  // Educational constants for reference
  COMMON_ORIGINS: {
    development: 'http://localhost:3000',
    liveServer: 'http://localhost:5500',
    python: 'http://localhost:8000'
  },
  
  COMMON_HEADERS: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept'
  ]
};