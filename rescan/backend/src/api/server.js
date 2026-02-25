/**
 * Educational Express.js Server for Rescan Recycling Application
 * 
 * This server demonstrates full-stack web development concepts:
 * - Express.js API server setup
 * - Middleware configuration (CORS, body parsing, static files)
 * - Route mounting and organization
 * - Error handling and logging
 * - Educational development server
 * 
 * Learning Objectives:
 * - Understand server-side JavaScript with Node.js
 * - Learn about HTTP servers and REST APIs
 * - Practice middleware concepts
 * - Explore file serving and static content
 */

// Educational Note: Load environment variables first
require('dotenv').config();

// Educational Note: Core dependencies
const express = require('express');
const cors = require('cors');
const path = require('path');

// Educational Note: Internal services and configuration
const dbService = require('../services/dbService');
const logger = require('../utils/logger');

// Educational Note: Route modules
const apiRoutes = require('./routes');

/**
 * Educational Function: Create Express Application
 * 
 * Configures and returns Express.js application with all middleware
 * Learn about: server setup, middleware stack, configuration patterns
 */
function createApp() {
    console.log('🚀 Starting Rescan Educational Server...');
    
    // Educational Note: Create Express application instance
    const app = express();
    
    // Educational Note: Trust proxy for deployment scenarios
    app.set('trust proxy', 1);
    
    // Educational Note: CORS Configuration for educational development
    const corsOptions = {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
        optionsSuccessStatus: 200 // Some legacy browsers choke on 204
    };
    
    app.use(cors(corsOptions));
    console.log('✅ CORS middleware configured');
    
    // Educational Note: Body parsing middleware
    app.use(express.json({ 
        limit: '10mb', // Educational: Allow larger file uploads
        strict: true   // Educational: Only parse arrays and objects
    }));
    app.use(express.urlencoded({ 
        extended: true,
        limit: '10mb'
    }));
    console.log('✅ Body parsing middleware configured');
    
    // Educational Note: Static file serving for frontend
    const frontendPath = path.join(__dirname, '../../../frontend');
    app.use(express.static(frontendPath));
    console.log(`✅ Static files served from: ${frontendPath}`);
    
    // Educational Note: Request logging middleware
    app.use((req, res, next) => {
        const timestamp = new Date().toISOString();
        console.log(`📡 ${timestamp} ${req.method} ${req.url}`);
        
        // Educational Note: Add educational headers
        res.set({
            'X-Educational-Project': 'Rescan-Recycling-Scanner',
            'X-Learning-Focus': 'Full-Stack-STEM-Education',
            'X-Powered-By': 'Students-Learning-Web-Development'
        });
        
        next();
    });
    
    // Educational Note: Helper function to check database connectivity
    // This is used by Kubernetes health and readiness probes
    async function checkDatabaseConnection() {
        try {
            // Test if dbService is initialized and can query
            const testQuery = () => new Promise((resolve, reject) => {
                if (!dbService.db) {
                    reject(new Error('Database not initialized'));
                    return;
                }
                dbService.db.get('SELECT 1 as test', [], (err, row) => {
                    if (err) reject(err);
                    else resolve(row && row.test === 1);
                });
            });
            
            return await testQuery();
        } catch (error) {
            console.error('❌ Database health check failed:', error.message);
            return false;
        }
    }
    
    // Educational Note: Health check endpoint for Kubernetes liveness probe
    // This endpoint tells Kubernetes if the application process is alive
    // If this fails repeatedly, Kubernetes will restart the pod
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
            educational: {
                message: 'Rescan Educational Server is running!',
                students: 'This endpoint is used for Kubernetes liveness probe',
                purpose: 'Checks if the application process is alive',
                note: 'If this fails, Kubernetes will restart the pod'
            }
        });
    });
    
    // Educational Note: Readiness check endpoint for Kubernetes readiness probe
    // This endpoint tells Kubernetes if the application is ready to serve traffic
    // If this fails, Kubernetes will stop sending traffic to this pod
    app.get('/ready', async (req, res) => {
        try {
            const dbConnected = await checkDatabaseConnection();
            
            if (dbConnected) {
                res.status(200).json({
                    status: 'ready',
                    timestamp: new Date().toISOString(),
                    checks: {
                        database: 'connected',
                        server: 'running'
                    },
                    educational: {
                        message: 'Application is ready to serve requests!',
                        students: 'This endpoint is used for Kubernetes readiness probe',
                        purpose: 'Checks if app can handle traffic (database connected)',
                        note: 'Pod receives traffic only when this returns 200 OK'
                    }
                });
            } else {
                res.status(503).json({
                    status: 'not ready',
                    timestamp: new Date().toISOString(),
                    checks: {
                        database: 'disconnected',
                        server: 'running'
                    },
                    educational: {
                        message: 'Application is not ready - database unavailable',
                        students: 'Kubernetes will not send traffic until this is fixed',
                        purpose: 'Prevents requests during database issues'
                    }
                });
            }
        } catch (error) {
            res.status(503).json({
                status: 'not ready',
                error: error.message,
                timestamp: new Date().toISOString(),
                educational: {
                    message: 'Readiness check failed',
                    students: 'Check database configuration and connectivity'
                }
            });
        }
    });
    
    // Educational Note: Mount API routes
    app.use('/api', apiRoutes);
    console.log('✅ API routes mounted at /api');
    
    // Educational Note: Redirect root to login page
    app.get('/', (req, res) => {
        res.redirect('/src/pages/login.html');
    });

    // Educational Note: Frontend route handler (SPA support)
    app.get('*', (req, res) => {
        // Educational Note: Serve login.html as the default landing page
        if (!req.url.startsWith('/api')) {
            const indexPath = path.join(frontendPath, 'src/pages/login.html');
            res.sendFile(indexPath, (err) => {
                if (err) {
                    console.error('❌ Error serving frontend:', err.message);
                    res.status(500).json({
                        error: 'FRONTEND_SERVE_ERROR',
                        message: 'Could not serve frontend application',
                        educational: {
                            concept: 'Static File Serving',
                            explanation: 'Web servers need to serve HTML, CSS, and JS files to browsers'
                        }
                    });
                }
            });
        }
    });
    
    // Educational Note: Global error handling middleware
    app.use((error, req, res, next) => {
        console.error('❌ Unhandled error:', error.message);
        console.error('Stack trace:', error.stack);
        
        // Educational Note: Don't expose server errors in production
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        res.status(500).json({
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
            ...(isDevelopment && {
                details: error.message,
                stack: error.stack
            }),
            educational: {
                concept: 'Error Handling',
                explanation: 'Global error handlers catch unhandled errors and prevent server crashes',
                tip: 'Always implement proper error boundaries in production applications'
            }
        });
    });
    
    // Educational Note: 404 handler for API routes
    app.use('/api/*', (req, res) => {
        res.status(404).json({
            error: 'API_ROUTE_NOT_FOUND',
            message: `API route not found: ${req.method} ${req.url}`,
            educational: {
                concept: 'HTTP Status Codes',
                explanation: '404 indicates the requested resource was not found',
                available_endpoints: [
                    'GET /api',
                    'GET /api/address/lookup',
                    'POST /api/scan/upload',
                    'GET /api/scan/history',
                    'PATCH /api/scan/:id/feedback'
                ]
            }
        });
    });
    
    console.log('✅ Express application configured successfully');
    return app;
}

/**
 * Educational Function: Start Server
 * 
 * Initializes database and starts HTTP server
 * Learn about: async server startup, dependency initialization, error handling
 */
async function startServer() {
    try {
        console.log('🏗️ Initializing server components...');
        
        // Educational Note: Initialize database service
        console.log('🗃️ Connecting to database...');
        await dbService.initialize();
        console.log('✅ Database connection established');
        
        // Educational Note: Create Express application
        const app = createApp();
        
        // Educational Note: Start HTTP server
        const port = process.env.PORT || 3000;
        const server = app.listen(port, () => {
            console.log('\\n🎉 ===================================');
            console.log('🎓 Rescan Educational Server Started!');
            console.log('🌐 Server URL:', `http://localhost:${port}`);
            console.log('📚 Frontend:', `http://localhost:${port}`);
            console.log('🔗 API Base:', `http://localhost:${port}/api`);
            console.log('===================================');
            console.log('\\n📖 Educational Endpoints Available:');
            console.log('   🏠 Home Page: http://localhost:3000');
            console.log('   🔐 Login: http://localhost:3000/src/pages/login.html');
            console.log('   📸 Scan: http://localhost:3000/src/pages/scan.html');
            console.log('   📡 API Info: http://localhost:3000/api');
            console.log('\\n🔬 Ready for User Story 2 Testing!');
            console.log('\\n💡 Learning Focus: AI Integration, File Uploads, Educational Feedback');
            console.log('====================================\\n');
        });
        
        // Educational Note: Graceful shutdown handling
        process.on('SIGINT', async () => {
            console.log('\\n🛑 Received shutdown signal (SIGINT)');
            console.log('🧹 Cleaning up resources...');
            
            // Educational Note: Close server
            server.close(() => {
                console.log('✅ HTTP server closed');
            });
            
            // Educational Note: Close database connection
            if (dbService.db) {
                await dbService.close();
                console.log('✅ Database connection closed');
            }
            
            console.log('👋 Server shutdown complete. Goodbye!');
            process.exit(0);
        });
        
        return server;
        
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        console.error('Stack trace:', error.stack);
        
        console.log('\\n🔧 Troubleshooting Tips:');
        console.log('1. Check if the database file exists: data/rescan.db');
        console.log('2. Verify environment variables in .env file');
        console.log('3. Ensure all dependencies are installed: npm install');
        console.log('4. Run database setup: npm run db:setup');
        console.log('\\nFor help, review the setup documentation in README.md\\n');
        
        process.exit(1);
    }
}

// Educational Note: Start server if this file is run directly
if (require.main === module) {
    startServer();
}

// Educational Note: Export for testing purposes
module.exports = { createApp, startServer };