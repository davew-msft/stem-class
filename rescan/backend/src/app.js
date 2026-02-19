/**
 * Express Server Application for Rescan Educational Project
 * ========================================================
 * 
 * Educational Focus: Learn Express.js server creation, middleware patterns,
 * and modern Node.js application architecture.
 * 
 * Key Learning Concepts:
 * - Express application initialization
 * - Middleware stack configuration
 * - Route organization and mounting
 * - Error handling patterns
 * - Server lifecycle management
 * - Educational debugging and logging
 */

const express = require('express');
const path = require('path');
const cors = require('cors');

// Educational Note: Import our configuration modules
// This demonstrates module separation and dependency injection
const { config } = require('./config/database');

/**
 * Educational Function: Create Express Application
 * 
 * This function demonstrates the Express application factory pattern,
 * allowing us to create configured app instances for different environments
 * (development, testing, production).
 * 
 * @returns {express.Application} Configured Express app
 */
function createApp() {
  // Educational Note: Create Express application instance
  console.log('🏗️ Creating Express application...');
  const app = express();
  
  // Educational Note: Trust proxy for educational deployments
  // This helps with proper IP detection when behind reverse proxies
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }
  
  // Educational Note: Set view engine for educational templating (if needed)
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../views'));
  
  // =========================================================================
  // EDUCATIONAL MIDDLEWARE STACK
  // =========================================================================
  // Students learn middleware order is important - each middleware
  // runs in the order it's added to the application
  
  console.log('⚙️ Configuring middleware stack...');
  
  // 1. Educational Request Logging
  // This helps students understand what requests are being made
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`📨 [${timestamp}] ${req.method} ${req.url} from ${req.ip}`);
    
    // Educational Note: Track request duration for learning
    req.startTime = Date.now();
    
    // Override res.end to log response time
    const originalEnd = res.end;
    res.end = function(...args) {
      const duration = Date.now() - req.startTime;
      console.log(`📤 [${timestamp}] ${res.statusCode} ${req.method} ${req.url} (${duration}ms)`);
      originalEnd.apply(this, args);
    };
    
    next();
  });
  
  // 2. Educational CORS Configuration
  // Learn about Cross-Origin Resource Sharing for API development
  const corsOptions = {
    origin: function (origin, callback) {
      // Educational Note: Allow requests from our frontend and development tools
      const allowedOrigins = [
        'http://localhost:3000',  // Frontend development server
        'http://127.0.0.1:3000',  // Alternative localhost
        'http://localhost:5500',  // Live Server extension
        'http://127.0.0.1:5500'   // Live Server alternative
      ];
      
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        const msg = `CORS error: Origin ${origin} not allowed`;
        console.warn(`⚠️ ${msg}`);
        callback(new Error(msg), false);
      }
    },
    credentials: true,  // Allow cookies for educational session management
    optionsSuccessStatus: 200  // Support legacy browsers
  };
  
  app.use(cors(corsOptions));
  
  // 3. Educational JSON and URL Encoding
  // Learn about request body parsing for API endpoints
  console.log('🔄 Setting up request body parsing...');
  app.use(express.json({
    limit: '10mb',  // Educational file upload support
    type: ['application/json', 'text/plain']
  }));
  
  app.use(express.urlencoded({
    extended: true,  // Support rich objects and arrays
    limit: '10mb'    // Match JSON limit
  }));
  
  // 4. Educational Static File Serving
  // Learn how Express serves HTML, CSS, JS, and image files
  console.log('📁 Setting up static file serving...');
  
  // Serve frontend files from frontend/src
  app.use(express.static(path.join(__dirname, '../../frontend/src'), {
    // Educational Note: Add educational headers
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache'); // Always fetch fresh HTML for development
      }
      res.setHeader('X-Educational-Server', 'Rescan-Learning-Express');
    }
  }));
  
  // Serve uploaded files (profile pictures, recycling photos)
  app.use('/uploads', express.static(path.join(__dirname, '../public/uploads'), {
    // Educational Note: Security headers for user uploads
    setHeaders: (res, path) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day cache
    }
  }));
  
  // =========================================================================
  // EDUCATIONAL ROUTE MOUNTING
  // =========================================================================
  console.log('🛤️ Setting up API routes...');
  
  // Educational Note: Health check endpoint for monitoring
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      educational: {
        message: 'Rescan Educational Server is running!',
        students: 'Check console logs to see request processing',
        database: config.database.filename
      }
    });
  });
  
  // Educational Note: Mount API routes
  // We'll add these route modules in subsequent tasks
  // app.use('/api/users', require('./api/routes/users'));
  // app.use('/api/materials', require('./api/routes/materials'));
  // app.use('/api/scans', require('./api/routes/scans'));
  // app.use('/api/locations', require('./api/routes/locations'));
  
  // Educational Note: Fallback route for Single Page Application
  // This serves the frontend's index.html for any unmatched routes
  app.get('*', (req, res) => {
    // Only serve index.html for non-API routes
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(__dirname, '../../frontend/src/pages/index.html'));
    } else {
      res.status(404).json({
        error: 'API endpoint not found',
        path: req.path,
        method: req.method,
        educational: 'Check the API documentation or implement this endpoint'
      });
    }
  });
  
  // =========================================================================
  // EDUCATIONAL ERROR HANDLING
  // =========================================================================
  console.log('🛡️ Setting up error handling...');
  
  // Educational Note: Catch-all error handler
  // This demonstrates centralized error handling in Express
  app.use((err, req, res, next) => {
    // Log error for educational debugging
    console.error('💥 Express Error Handler:');
    console.error(`   URL: ${req.method} ${req.url}`);
    console.error(`   Error: ${err.message}`);
    if (process.env.EDUCATIONAL_MODE === 'true') {
      console.error(`   Stack: ${err.stack}`);
    }
    
    // Educational response format
    const errorResponse = {
      error: err.message || 'Internal server error',
      status: err.status || 500,
      timestamp: new Date().toISOString(),
    };
    
    // Add stack trace in development for learning
    if (process.env.NODE_ENV !== 'production') {
      errorResponse.stack = err.stack;
      errorResponse.educational = {
        tip: 'Check server console for detailed error information',
        debugging: 'Use browser dev tools Network tab to see this response'
      };
    }
    
    res.status(err.status || 500).json(errorResponse);
  });
  
  console.log('✅ Express application configured successfully');
  return app;
}

/**
 * Educational Function: Start Server
 * 
 * Demonstrates server startup patterns and graceful error handling
 * 
 * @param {number} port - Port number to listen on
 * @returns {Promise<http.Server>} Started HTTP server
 */
function startServer(port = 3001) {
  return new Promise((resolve, reject) => {
    const app = createApp();
    
    console.log(`🚀 Starting Rescan Educational Server...`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Port: ${port}`);
    console.log(`   Database: ${config.database.filename}`);
    
    const server = app.listen(port, (err) => {
      if (err) {
        console.error('❌ Failed to start server:', err.message);
        reject(err);
        return;
      }
      
      console.log('🎉 Educational Server Started Successfully!');
      console.log(`📍 Server URL: http://localhost:${port}`);
      console.log(`🏥 Health Check: http://localhost:${port}/health`);
      console.log(`📚 Educational Dashboard: http://localhost:${port}`);
      console.log('');
      console.log('🎓 Educational Notes:');
      console.log('   - Watch this console for request logs');
      console.log('   - Check browser Network tab to see API calls');
      console.log('   - Visit /health endpoint to test server response');
      console.log('   - Use Ctrl+C to gracefully stop the server');
      console.log('');
      
      resolve(server);
    });
    
    // Educational Note: Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use. Try a different port.`);
        console.error('💡 Educational Tip: Check if another server is running');
      } else {
        console.error('❌ Server error:', error.message);
      }
      reject(error);
    });
  });
}

// Educational Note: Export both factory function and starter function
module.exports = {
  createApp,
  startServer
};

// Educational Note: If this file is run directly, start the server
if (require.main === module) {
  const port = process.env.PORT || 3001;
  
  startServer(port)
    .then((server) => {
      console.log('🎯 Server ready for educational development!');
      
      // Educational Note: Graceful shutdown handling
      process.on('SIGINT', () => {
        console.log('\n📴 Received interrupt signal, shutting down gracefully...');
        server.close(() => {
          console.log('✅ Server stopped successfully');
          process.exit(0);
        });
      });
    })
    .catch((error) => {
      console.error('💥 Fatal server error:', error.message);
      process.exit(1);
    });
}