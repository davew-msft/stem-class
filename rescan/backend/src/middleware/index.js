/**
 * Middleware Module Exports for Rescan Educational Project
 * =======================================================
 * 
 * Educational Focus: Learn module organization, middleware composition,
 * and clean code architecture patterns.
 * 
 * Key Learning Concepts:
 * - Module organization and exports
 * - Middleware composition and ordering
 * - Separation of concerns
 * - Reusable middleware patterns
 */

// Educational Note: Import all our custom middleware modules
const logging = require('./logging');
const errorHandler = require('./errorHandler');
const cors = require('./cors');

/**
 * Educational Function: Create complete middleware stack
 * 
 * This function demonstrates how to compose multiple middleware
 * into a single, reusable configuration for different environments.
 * 
 * @param {string} environment - Environment type ('development', 'production', 'test')
 * @returns {Object} Complete middleware configuration
 */
function createMiddlewareStack(environment = 'development') {
  console.log(`🏗️ Creating middleware stack for ${environment} environment...`);
  
  return {
    // Educational Note: Pre-route middleware (runs before route handlers)
    preRoute: [
      // 1. CORS must come first to handle preflight requests
      cors.getCorsMiddleware(environment),
      
      // 2. Security headers for protection
      cors.securityHeaders,
      
      // 3. Request logging for debugging
      logging.requestLogger,
      
      // 4. Detailed logging in development only
      ...(environment === 'development' ? [logging.detailedLogger] : []),
      
      // 5. CORS logging for education
      cors.corsLogger,
    ],
    
    // Educational Note: Post-route middleware (runs after routes, handles errors)
    postRoute: [
      // 1. Handle 404 errors for unmatched routes
      errorHandler.notFoundHandler,
      
      // 2. Error logging for debugging
      logging.errorLogger,
      
      // 3. Main error handler (must be last)
      errorHandler.errorHandler,
    ]
  };
}

/**
 * Educational Function: Apply middleware stack to Express app
 * 
 * Demonstrates how to systematically apply middleware to an Express application
 * 
 * @param {express.Application} app - Express app instance
 * @param {string} environment - Environment type
 */
function applyMiddlewareStack(app, environment = 'development') {
  const middleware = createMiddlewareStack(environment);
  
  console.log('🔧 Applying pre-route middleware...');
  middleware.preRoute.forEach((mw, index) => {
    console.log(`   ${index + 1}. ${mw.name || 'Anonymous middleware'}`);
    app.use(mw);
  });
  
  return {
    // Educational Note: Return post-route middleware for later application
    applyPostRouteMiddleware: () => {
      console.log('🔧 Applying post-route middleware (error handlers)...');
      middleware.postRoute.forEach((mw, index) => {
        console.log(`   ${index + 1}. ${mw.name || 'Anonymous middleware'}`);
        app.use(mw);
      });
    }
  };
}

/**
 * Educational Function: Get specific middleware by name
 * 
 * Provides access to individual middleware for custom configurations
 * 
 * @param {string} name - Middleware name
 * @returns {Function|Object} Requested middleware
 */
function getMiddleware(name) {
  const middlewareMap = {
    // Logging middleware
    'requestLogger': logging.requestLogger,
    'detailedLogger': logging.detailedLogger,
    'errorLogger': logging.errorLogger,
    
    // Error handling middleware
    'errorHandler': errorHandler.errorHandler,
    'notFoundHandler': errorHandler.notFoundHandler,
    'asyncErrorHandler': errorHandler.asyncErrorHandler,
    
    // CORS middleware
    'cors': cors.getCorsMiddleware,
    'corsLogger': cors.corsLogger,
    'securityHeaders': cors.securityHeaders,
  };
  
  const middleware = middlewareMap[name];
  
  if (!middleware) {
    console.warn(`⚠️ Middleware "${name}" not found. Available middleware:`);
    console.warn('   ' + Object.keys(middlewareMap).join(', '));
    return null;
  }
  
  return middleware;
}

/**
 * Educational Function: Create educational middleware info
 * 
 * Returns information about all available middleware for learning purposes
 * 
 * @returns {Object} Middleware documentation
 */
function getMiddlewareInfo() {
  return {
    description: 'Educational middleware for the Rescan project',
    
    categories: {
      logging: {
        description: 'Request/response logging and debugging',
        middleware: {
          requestLogger: 'Logs incoming requests and outgoing responses',
          detailedLogger: 'Detailed request analysis (development only)',
          errorLogger: 'Logs errors with context for debugging'
        }
      },
      
      errorHandling: {
        description: 'Error catching, formatting, and response',
        middleware: {
          errorHandler: 'Main error handler with educational formatting',
          notFoundHandler: 'Handles 404 errors for missing routes',
          asyncErrorHandler: 'Wrapper for async route handlers'
        }
      },
      
      cors: {
        description: 'Cross-Origin Resource Sharing configuration',
        middleware: {
          cors: 'CORS policy enforcement and preflight handling',
          corsLogger: 'Logs CORS requests for educational purposes',
          securityHeaders: 'Adds security headers to responses'
        }
      }
    },
    
    order: {
      description: 'Recommended middleware order',
      preRoute: [
        'CORS (handle preflight)',
        'Security Headers',
        'Request Logger',
        'Detailed Logger (dev only)',
        'Body Parser',
        'Static Files'
      ],
      postRoute: [
        '404 Handler',
        'Error Logger', 
        'Error Handler (must be last)'
      ]
    },
    
    educational: {
      tips: [
        'Middleware order matters - each runs in sequence',
        'Error middleware must have 4 parameters: (err, req, res, next)',
        '404 handler should come after all routes but before error handler',
        'Use asyncErrorHandler wrapper to avoid try-catch in every route'
      ]
    }
  };
}

// Educational Export: Organize exports by category for easy learning
module.exports = {
  // Main functions for application setup
  createMiddlewareStack,
  applyMiddlewareStack,
  getMiddleware,
  
  // Direct access to middleware modules
  logging,
  errorHandler,
  cors,
  
  // Educational utilities
  getMiddlewareInfo,
  
  // Convenience exports for common patterns
  async: errorHandler.asyncErrorHandler,
  createError: errorHandler.createError,
  AppError: errorHandler.AppError,
  
  // Educational constants
  ENVIRONMENT_TYPES: ['development', 'production', 'test'],
  
  // Quick access for specific use cases
  development: () => createMiddlewareStack('development'),
  production: () => createMiddlewareStack('production'),
  test: () => createMiddlewareStack('test'),
};

// Educational Note: Log when module is loaded
console.log('📦 Middleware module loaded - ready for educational Express development!');