/**
 * Error Handling Middleware for Rescan Educational Project
 * =======================================================
 * 
 * Educational Focus: Learn centralized error handling, HTTP status codes,
 * and debugging techniques in Express applications.
 * 
 * Key Learning Concepts:
 * - Express error middleware patterns (err, req, res, next signature)
 * - HTTP status code meanings and proper usage
 * - Error classification and response formatting
 * - Development vs production error handling
 * - Security considerations in error messages
 */

/**
 * Educational Class: Custom Application Errors
 * 
 * Demonstrates custom error classes for better error handling and debugging
 */
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    this.isOperational = isOperational; // Is this a known operational error?
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Educational Function: Create specific error types for common scenarios
 * 
 * These helper functions teach students about different HTTP error types
 */
const createError = {
  // 400 Bad Request - Client sent invalid data
  badRequest: (message = 'Bad request - invalid data provided') => 
    new AppError(message, 400),
    
  // 401 Unauthorized - Authentication required
  unauthorized: (message = 'Unauthorized - please log in') => 
    new AppError(message, 401),
    
  // 403 Forbidden - Authenticated but not authorized
  forbidden: (message = 'Forbidden - insufficient permissions') => 
    new AppError(message, 403),
    
  // 404 Not Found - Resource doesn't exist
  notFound: (message = 'Resource not found') => 
    new AppError(message, 404),
    
  // 409 Conflict - Resource already exists or business rule violation
  conflict: (message = 'Conflict - resource already exists') => 
    new AppError(message, 409),
    
  // 422 Unprocessable Entity - Data is valid but business rules prevent processing
  unprocessableEntity: (message = 'Unprocessable entity - validation failed') => 
    new AppError(message, 422),
    
  // 429 Too Many Requests - Rate limiting
  tooManyRequests: (message = 'Too many requests - please try again later') => 
    new AppError(message, 429),
    
  // 500 Internal Server Error - Something went wrong on our end
  internal: (message = 'Internal server error') => 
    new AppError(message, 500, false)
};

/**
 * Educational Function: Format error for educational responses
 * 
 * Demonstrates how to structure error responses for both learning and security
 * 
 * @param {Error} err - Error object to format
 * @param {boolean} isProduction - Whether we're in production mode
 * @returns {Object} Formatted error response
 */
function formatErrorResponse(err, isProduction = false) {
  // Educational Note: Base error response structure
  const errorResponse = {
    success: false,
    error: {
      message: err.message,
      status: err.statusCode || 500,
      type: err.status || 'error',
      timestamp: new Date().toISOString(),
    }
  };
  
  // Educational Note: Add debugging information in development
  if (!isProduction) {
    errorResponse.error.stack = err.stack;
    errorResponse.debug = {
      tip: 'Check server console for detailed error logs',
      helpul_links: {
        status_codes: 'https://httpstatuses.com/',
        debugging: 'https://expressjs.com/en/guide/error-handling.html'
      }
    };
    
    // Educational Note: Add operational flag for learning
    if (err.isOperational !== undefined) {
      errorResponse.debug.operational = err.isOperational;
      errorResponse.debug.explanation = err.isOperational 
        ? 'This is an expected error (user mistake, validation, etc.)'
        : 'This is an unexpected error (bug, system failure, etc.)';
    }
  }
  
  return errorResponse;
}

/**
 * Educational Function: Log error details for debugging
 * 
 * Demonstrates structured error logging for development and monitoring
 * 
 * @param {Error} err - Error to log
 * @param {express.Request} req - Request where error occurred  
 */
function logError(err, req) {
  const timestamp = new Date().toISOString();
  const requestId = req.requestId || 'unknown';
  
  console.error(`\n💥 [${timestamp}] Error in Request ${requestId}:`);
  console.error(`   🎯 Route: ${req.method} ${req.url}`);
  console.error(`   📍 IP: ${req.ip}`);
  console.error(`   🔢 Status: ${err.statusCode || 500}`);
  console.error(`   💬 Message: ${err.message}`);
  
  // Log request details that might help debug
  if (req.body && Object.keys(req.body).length > 0) {
    console.error(`   📨 Request Body: ${JSON.stringify(req.body)}`);
  }
  
  if (req.params && Object.keys(req.params).length > 0) {
    console.error(`   🎯 URL Params: ${JSON.stringify(req.params)}`);
  }
  
  if (req.query && Object.keys(req.query).length > 0) {
    console.error(`   🔍 Query Params: ${JSON.stringify(req.query)}`);
  }
  
  // Educational Note: Show stack trace for unexpected errors
  if (!err.isOperational || process.env.EDUCATIONAL_MODE === 'true') {
    console.error(`   📚 Stack Trace:\n${err.stack}`);
  }
  
  console.error(''); // Empty line for readability
}

/**
 * Educational Middleware: Not Found Handler
 * 
 * Handles requests to non-existent routes with helpful educational messages
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function notFoundHandler(req, res, next) {
  const message = `Route not found: ${req.method} ${req.originalUrl}`;
  
  // Educational Note: Create a 404 error and pass to error handler
  const error = createError.notFound(message);
  
  next(error);
}

/**
 * Educational Middleware: Main Error Handler
 * 
 * This is the main error handling middleware that processes all errors
 * in the application. It demonstrates proper error handling patterns.
 * 
 * Important: Must have 4 parameters (err, req, res, next) to be recognized
 * as an error middleware by Express.
 * 
 * @param {Error} err - Error object  
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @param {express.NextFunction} next - Express next function
 */
function errorHandler(err, req, res, next) {
  // Educational Note: Log the error for debugging
  logError(err, req);
  
  // Educational Note: Set default error values if not provided
  let error = { ...err };
  error.message = err.message;
  
  // Handle specific error types for educational purposes
  if (err.name === 'ValidationError') {
    // MongoDB/Mongoose validation errors
    const message = Object.values(err.errors).map(e => e.message).join(', ');
    error = createError.badRequest(`Validation Error: ${message}`);
  }
  
  if (err.code === 11000) {
    // MongoDB duplicate key error
    const field = Object.keys(err.keyValue || {})[0];
    const message = `Duplicate field value for ${field}. Choose another value.`;
    error = createError.conflict(message);
  }
  
  if (err.name === 'JsonWebTokenError') {
    // JWT errors
    const message = 'Invalid token. Please log in again.';
    error = createError.unauthorized(message);
  }
  
  if (err.name === 'TokenExpiredError') {
    // Expired JWT
    const message = 'Token expired. Please log in again.';
    error = createError.unauthorized(message);
  }
  
  if (err.name === 'CastError') {
    // MongoDB invalid ID format
    const message = `Invalid ${err.path}: ${err.value}`;
    error = createError.badRequest(message);
  }
  
  // Educational Note: SQLite specific errors for our database
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    const message = 'Duplicate entry - this record already exists';
    error = createError.conflict(message);
  }
  
  if (err.code === 'SQLITE_CONSTRAINT_FOREIGN_KEY') {
    const message = 'Foreign key constraint failed - referenced record does not exist';
    error = createError.badRequest(message);
  }
  
  // Educational Note: Determine if we're in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Educational Note: Format error response
  const errorResponse = formatErrorResponse(error, isProduction);
  
  // Educational Note: Send error response to client
  res.status(error.statusCode || 500).json(errorResponse);
}

/**
 * Educational Middleware: Async Error Wrapper
 * 
 * This utility wraps async functions to automatically catch errors
 * and pass them to the error handler, eliminating the need for
 * try-catch blocks in every async route handler.
 * 
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
function asyncErrorHandler(fn) {
  return (req, res, next) => {
    // Educational Note: Execute async function and catch any Promise rejections
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Educational Function: Express error
 * 
 * Convenience function for throwing errors in routes
 * 
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @throws {AppError} Throws an AppError with the provided details
 */
function throwError(message, statusCode = 500) {
  throw new AppError(message, statusCode);
}

// Educational Export: Make all error utilities available
module.exports = {
  AppError,
  createError,
  errorHandler,
  notFoundHandler,
  asyncErrorHandler,
  throwError,
  
  // Educational utilities for testing and debugging
  formatErrorResponse,
  logError,
};