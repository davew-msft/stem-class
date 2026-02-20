/**
 * Request Logging Middleware for Rescan Educational Project
 * ========================================================
 * 
 * Educational Focus: Learn HTTP request/response logging, debugging techniques,
 * and performance monitoring with custom Express middleware.
 * 
 * Key Learning Concepts:
 * - Custom Express middleware creation
 * - Request/response lifecycle hooks
 * - Performance timing measurement
 * - Educational debugging patterns
 * - HTTP status code meanings
 */

const colors = {
  // Educational Note: Console colors for different HTTP methods
  GET: '\x1b[32m',      // Green
  POST: '\x1b[33m',     // Yellow  
  PUT: '\x1b[34m',      // Blue
  DELETE: '\x1b[31m',   // Red
  PATCH: '\x1b[35m',    // Magenta
  reset: '\x1b[0m'      // Reset color
};

/**
 * Educational Function: Format file size for human reading
 * 
 * Demonstrates utility function patterns and data formatting
 * 
 * @param {number} bytes - File size in bytes
 * @returns {string} Human-readable size (e.g., "1.2 KB", "3.4 MB")  
 */
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(1);
  
  return `${size} ${sizes[i]}`;
}

/**
 * Educational Function: Get status code emoji for visual learning
 * 
 * Helps students quickly understand HTTP status codes through visual cues
 * 
 * @param {number} statusCode - HTTP status code
 * @returns {string} Emoji representing the status type
 */
function getStatusEmoji(statusCode) {
  if (statusCode >= 200 && statusCode < 300) return '✅'; // Success
  if (statusCode >= 300 && statusCode < 400) return '↩️';  // Redirect
  if (statusCode >= 400 && statusCode < 500) return '❌'; // Client Error
  if (statusCode >= 500) return '💥';                     // Server Error
  return '❓'; // Unknown
}

/**
 * Educational Middleware: Request Logger
 * 
 * This middleware demonstrates:
 * - How Express middleware functions work (req, res, next pattern)
 * - Request timing measurement
 * - Response modification techniques
 * - Educational debugging output
 * 
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object  
 * @param {express.NextFunction} next - Express next function
 */
function requestLogger(req, res, next) {
  // Educational Note: Record request start time for performance measurement
  req.startTime = Date.now();
  req.requestId = Math.random().toString(36).substr(2, 9); // Simple request ID for tracking
  
  // Educational Note: Extract useful request information
  const timestamp = new Date().toISOString();
  const methodColor = colors[req.method] || colors.reset;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const contentLength = req.get('Content-Length');
  
  // Log incoming request with educational information
  console.log(`\n📨 [${timestamp}] Incoming Request:`);
  console.log(`   🔍 ID: ${req.requestId}`);
  console.log(`   ${methodColor}${req.method}${colors.reset} ${req.url}`);
  console.log(`   🌐 From: ${req.ip}`);
  console.log(`   📱 User-Agent: ${userAgent.substring(0, 50)}${userAgent.length > 50 ? '...' : ''}`);
  
  if (contentLength) {
    console.log(`   📦 Content-Length: ${formatSize(parseInt(contentLength))}`);
  }
  
  if (Object.keys(req.query).length > 0) {
    console.log(`   🔍 Query: ${JSON.stringify(req.query)}`);
  }
  
  // Educational Note: Override res.end to capture response details
  const originalEnd = res.end;
  const originalSend = res.send;
  let responseBody = null;
  
  // Capture response body for educational logging
  res.send = function(data) {
    responseBody = data;
    return originalSend.call(this, data);
  };
  
  res.end = function(chunk, encoding) {
    // Calculate request duration
    const duration = Date.now() - req.startTime;
    const timestamp = new Date().toISOString();
    
    // Educational Note: Determine response size
    let responseSize = 0;
    if (chunk) {
      responseSize = Buffer.byteLength(chunk, encoding);
    } else if (responseBody) {
      responseSize = Buffer.byteLength(JSON.stringify(responseBody));
    }
    
    // Log response with educational details
    const statusEmoji = getStatusEmoji(res.statusCode);
    
    console.log(`📤 [${timestamp}] Response Complete:`);
    console.log(`   🔍 ID: ${req.requestId}`);
    console.log(`   ${statusEmoji} ${res.statusCode} ${req.method} ${req.url}`);
    console.log(`   ⏱️ Duration: ${duration}ms`);
    console.log(`   📏 Size: ${formatSize(responseSize)}`);
    console.log(`   📋 Content-Type: ${res.get('Content-Type') || 'not set'}`);
    
    // Educational performance warnings
    if (duration > 1000) {
      console.log(`   ⚠️ SLOW REQUEST: ${duration}ms (consider optimization)`);
    }
    
    if (responseSize > 1024 * 1024) { // 1MB
      console.log(`   ⚠️ LARGE RESPONSE: ${formatSize(responseSize)} (consider pagination)`);
    }
    
    console.log(''); // Empty line for readability
    
    // Call original end function
    return originalEnd.call(this, chunk, encoding);
  };
  
  // Educational Note: Continue to next middleware
  next();
}

/**
 * Educational Middleware: Development-only detailed logger
 * 
 * Provides even more detailed logging for educational environments
 * Only active when NODE_ENV is development
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
function detailedLogger(req, res, next) {
  // Only run in development mode
  if (process.env.NODE_ENV !== 'development' && process.env.EDUCATIONAL_MODE !== 'true') {
    return next();
  }
  
  console.log('🔬 Detailed Educational Analysis:');
  console.log(`   📋 Headers: ${JSON.stringify(req.headers, null, 2)}`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`   📨 Body: ${JSON.stringify(req.body, null, 2)}`);
  }
  
  if (req.params && Object.keys(req.params).length > 0) {
    console.log(`   🎯 Params: ${JSON.stringify(req.params)}`);
  }
  
  console.log('');
  next();
}

/**
 * Educational Middleware: Error timing tracker
 * 
 * Demonstrates error handling timing for educational debugging
 */
function errorLogger(err, req, res, next) {
  const duration = req.startTime ? Date.now() - req.startTime : 0;
  
  console.log(`💥 Error in request ${req.requestId || 'unknown'}:`);
  console.log(`   ⏱️ Failed after: ${duration}ms`);
  console.log(`   🎯 Route: ${req.method} ${req.url}`);
  console.log(`   💬 Error: ${err.message}`);
  
  if (process.env.EDUCATIONAL_MODE === 'true') {
    console.log(`   📚 Stack: ${err.stack}`);
  }
  
  next(err);
}

// Educational Export: Make loggers available to other modules
module.exports = {
  requestLogger,
  detailedLogger,
  errorLogger,
  
  // Educational utilities for other middleware
  formatSize,
  getStatusEmoji
};