/**
 * Server Startup Script for Rescan Educational Project
 * ===================================================
 * 
 * Educational Focus: Learn application bootstrap patterns, server lifecycle management,
 * and production-ready startup procedures.
 * 
 * Key Learning Concepts:
 * - Application initialization order
 * - Environment configuration loading
 * - Database connection management
 * - Graceful startup and shutdown procedures
 * - Error handling and recovery patterns
 * - Educational logging and monitoring
 */

// Educational Note: Load environment configuration first
const { config, isDevelopment, isProduction } = require('./config/environment');

// Educational Note: Import core application modules
const { createApp } = require('./app');
const { initializeSchema, testConnection } = require('./config/database');

/**
 * Educational Function: Pre-startup System Checks
 * 
 * Demonstrates system validation before starting the server
 * Learn about: dependency checking, early error detection, health validation
 * 
 * @returns {Promise<boolean>} True if all checks pass
 */
async function performStartupChecks() {
  console.log('🔍 Performing pre-startup system checks...');
  
  const checks = [];
  
  // Educational Note: Check 1 - Database connectivity
  checks.push({
    name: 'Database Connection',
    check: async () => {
      try {
        const connected = await testConnection();
        return { success: connected, message: 'Database connection verified' };
      } catch (error) {
        return { success: false, message: `Database connection failed: ${error.message}` };
      }
    }
  });
  
  // Educational Note: Check 2 - Upload directory
  checks.push({
    name: 'Upload Directory',
    check: async () => {
      const fs = require('fs');
      const path = require('path');
      
      try {
        const uploadDir = config.uploads.directory;
        const fullPath = path.resolve(uploadDir);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath, { recursive: true });
        }
        
        // Test write permissions
        const testFile = path.join(fullPath, '.write-test');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        
        return { success: true, message: `Upload directory ready at ${fullPath}` };
      } catch (error) {
        return { success: false, message: `Upload directory error: ${error.message}` };
      }
    }
  });
  
  // Educational Note: Check 3 - Azure OpenAI Configuration (if configured)
  checks.push({
    name: 'AI Service Configuration',
    check: async () => {
      const aiConfig = config.ai.azure;
      
      if (!aiConfig.apiKey && isProduction) {
        return { success: false, message: 'Azure OpenAI API key required in production' };
      }
      
      if (!aiConfig.endpoint && isProduction) {
        return { success: false, message: 'Azure OpenAI endpoint required in production' };
      }
      
      if (!aiConfig.apiKey || !aiConfig.endpoint) {
        return { success: true, message: 'AI service not configured (development mode)' };
      }
      
      // TODO: Test actual Azure OpenAI connection
      return { success: true, message: 'AI service configuration looks valid' };
    }
  });
  
  // Educational Note: Run all checks
  let allChecksPassed = true;
  
  for (const { name, check } of checks) {
    try {
      const result = await check();
      
      if (result.success) {
        console.log(`   ✅ ${name}: ${result.message}`);
      } else {
        console.error(`   ❌ ${name}: ${result.message}`);
        allChecksPassed = false;
      }
    } catch (error) {
      console.error(`   💥 ${name}: Unexpected error - ${error.message}`);
      allChecksPassed = false;
    }
  }
  
  if (allChecksPassed) {
    console.log('✅ All startup checks passed!\n');
  } else {
    console.error('❌ Some startup checks failed. Review configuration and try again.\n');
  }
  
  return allChecksPassed;
}

/**
 * Educational Function: Initialize Database Schema
 * 
 * Demonstrates database initialization patterns
 * Learn about: schema management, data seeding, migration patterns
 * 
 * @returns {Promise<boolean>} True if initialization successful
 */
async function initializeDatabase() {
  try {
    console.log('📊 Initializing database schema...');
    
    // Educational Note: Initialize schema with educational sample data
    await initializeSchema();
    
    console.log('✅ Database schema initialized successfully!\n');
    return true;
    
  } catch (error) {
    console.error('💥 Database initialization failed:', error.message);
    
    if (isDevelopment) {
      console.error('📚 Educational Debug Info:');
      console.error('   - Check if SQLite is installed');
      console.error('   - Verify data directory permissions');
      console.error('   - Review database configuration in .env file');
      console.error(`   - Database path: ${config.database.filename}`);
    }
    
    throw error;
  }
}

/**
 * Educational Function: Start HTTP Server
 * 
 * Demonstrates server startup patterns with error handling
 * Learn about: HTTP server lifecycle, port management, startup logging
 * 
 * @returns {Promise<http.Server>} Started HTTP server instance
 */
async function startHttpServer() {
  try {
    console.log('🚀 Starting HTTP server...');
    
    // Educational Note: Create Express application
    const app = createApp();
    
    // Educational Note: Mount API routes
    const apiRoutes = require('./api/routes');
    app.use('/api', apiRoutes);
    console.log('🛤️ API routes mounted at /api');
    
    // Educational Note: Start server on configured port
    const server = await new Promise((resolve, reject) => {
      const httpServer = app.listen(config.server.port, config.server.host, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        resolve(httpServer);
      });
      
      // Educational Note: Handle server startup errors
      httpServer.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          reject(new Error(`Port ${config.server.port} is already in use. Try a different port.`));
        } else {
          reject(error);
        }
      });
    });
    
    // Educational Note: Log startup success with helpful information
    console.log('\n🎉 Rescan Educational Server Started Successfully!');
    console.log('='.repeat(50));
    console.log(`📍 Server URL: http://${config.server.host}:${config.server.port}`);
    console.log(`🏥 Health Check: http://${config.server.host}:${config.server.port}/health`);
    console.log(`📚 API Documentation: http://${config.server.host}:${config.server.port}/api`);
    console.log(`🗃️ Database: ${config.database.filename}`);
    console.log(`📁 Upload Directory: ${config.uploads.directory}`);
    console.log(`🌟 Environment: ${config.environment.name}`);
    console.log(`🎓 Educational Mode: ${config.educational.enabled ? 'ON' : 'OFF'}`);
    console.log('='.repeat(50));
    console.log('\n📖 Educational Quick Start:');
    console.log('   1. Open your browser to the server URL above');
    console.log('   2. Visit /api for API documentation and examples');
    console.log('   3. Try uploading an image to /api/scans for AI identification');
    console.log('   4. Explore materials database at /api/materials');
    console.log('   5. Find recycling locations at /api/locations');
    console.log('\n💡 Development Tips:');
    console.log('   - Watch this console for request logs');
    console.log('   - Check browser Network tab to see API calls');
    console.log('   - Use Postman or curl to test API endpoints');
    console.log('   - Press Ctrl+C to gracefully stop the server');
    console.log('');
    
    return server;
    
  } catch (error) {
    console.error('💥 Failed to start HTTP server:', error.message);
    throw error;
  }
}

/**
 * Educational Function: Setup Graceful Shutdown
 * 
 * Demonstrates proper server shutdown procedures
 * Learn about: signal handling, resource cleanup, graceful termination
 * 
 * @param {http.Server} server - HTTP server instance to manage
 */
function setupGracefulShutdown(server) {
  // Educational Note: Track active connections for graceful shutdown
  const connections = new Set();
  
  server.on('connection', (connection) => {
    connections.add(connection);
    connection.on('close', () => {
      connections.delete(connection);
    });
  });
  
  // Educational Note: Handle shutdown signals
  const shutdownSignals = ['SIGTERM', 'SIGINT'];
  
  shutdownSignals.forEach((signal) => {
    process.on(signal, async () => {
      console.log(`\n📴 Received ${signal}, starting graceful shutdown...`);
      
      try {
        // Educational Note: Stop accepting new connections
        console.log('🔒 Stopping new connections...');
        server.close(async (err) => {
          if (err) {
            console.error('❌ Error during server close:', err.message);
            process.exit(1);
          }
          
          console.log('✅ HTTP server closed');
        });
        
        // Educational Note: Close existing connections gracefully
        console.log(`🔌 Closing ${connections.size} active connections...`);
        for (const connection of connections) {
          connection.destroy();
        }
        
        // Educational Note: Give time for cleanup
        console.log('⏱️ Waiting for cleanup to complete...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('✅ Graceful shutdown complete');
        console.log('👋 Thank you for using Rescan Educational Server!');
        process.exit(0);
        
      } catch (shutdownError) {
        console.error('💥 Error during graceful shutdown:', shutdownError.message);
        process.exit(1);
      }
    });
  });
  
  console.log('🛡️ Graceful shutdown handlers registered (Ctrl+C or SIGTERM)');
}

/**
 * Educational Function: Handle Startup Errors
 * 
 * Demonstrates error handling and recovery patterns
 * Learn about: error classification, recovery strategies, user feedback
 * 
 * @param {Error} error - Startup error to handle
 */
function handleStartupError(error) {
  console.error('\n💥 Startup Error Occurred:');
  console.error('='.repeat(50));
  console.error(`Error: ${error.message}`);
  
  // Educational Note: Provide context-specific help
  if (error.message.includes('EADDRINUSE')) {
    console.error('\n🔧 Problem: Port is already in use');
    console.error('📚 Solutions:');
    console.error('   1. Stop other servers using this port');
    console.error('   2. Change PORT in your .env file');
    console.error('   3. Use a different port: PORT=3002 node server.js');
    
  } else if (error.message.includes('Database')) {
    console.error('\n🔧 Problem: Database connection error');
    console.error('📚 Solutions:');
    console.error('   1. Check if data directory exists and has write permissions');
    console.error('   2. Verify DATABASE_URL in .env file');
    console.error('   3. Try deleting and recreating the database file');
    
  } else if (error.message.includes('permission')) {
    console.error('\n🔧 Problem: File system permissions');
    console.error('📚 Solutions:');
    console.error('   1. Check directory permissions for uploads');
    console.error('   2. Run with appropriate user permissions');
    console.error('   3. Create required directories manually');
    
  } else {
    console.error('\n📚 General Troubleshooting:');
    console.error('   1. Check your .env file configuration');
    console.error('   2. Verify all dependencies are installed: npm install');
    console.error('   3. Review the error details above');
    console.error('   4. Ask for help in educational forums or discussions');
  }
  
  console.error('\n🆘 For additional help:');
  console.error('   - Check the README.md file for setup instructions');
  console.error('   - Review the .env.example file for configuration examples');
  console.error('   - Enable debug mode: DEBUG=* in your .env file');
  console.error('='.repeat(50));
  
  process.exit(1);
}

/**
 * Educational Function: Main Startup Sequence
 * 
 * Orchestrates the complete server startup process
 * Learn about: startup sequencing, dependency management, initialization patterns
 */
async function startServer() {
  try {
    console.log('🎓 Rescan Educational Server - Startup Sequence');
    console.log('='.repeat(50));
    console.log('🌱 Initializing environmental awareness through technology...\n');
    
    // Educational Note: Step 1 - System validation
    const checksPass = await performStartupChecks();
    if (!checksPass) {
      throw new Error('Pre-startup system checks failed');
    }
    
    // Educational Note: Step 2 - Database initialization
    await initializeDatabase();
    
    // Educational Note: Step 3 - HTTP server startup
    const server = await startHttpServer();
    
    // Educational Note: Step 4 - Graceful shutdown setup
    setupGracefulShutdown(server);
    
    // Educational Note: Startup complete
    console.log('🚀 Startup sequence completed successfully!');
    console.log('🎯 Ready for educational recycling experiences!\n');
    
  } catch (error) {
    handleStartupError(error);
  }
}

// Educational Note: Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

// Educational Export: Make startup function available for testing
module.exports = {
  startServer,
  performStartupChecks,
  initializeDatabase,
  startHttpServer,
  setupGracefulShutdown
};