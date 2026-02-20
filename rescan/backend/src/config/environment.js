/**
 * Environment Configuration Loader for Rescan Educational Project
 * ==============================================================
 * 
 * Educational Focus: Learn environment variable management, configuration patterns,
 * and application security through proper secret handling.
 * 
 * Key Learning Concepts:
 * - Environment variables and the .env file
 * - Configuration validation and defaults
 * - Security considerations for secrets
 * - Different environments (development, production, test)
 * - Configuration object patterns
 * - Error handling for missing configurations
 */

const path = require('path');

// Educational Note: Load environment variables from .env file
// This must be done as early as possible in the application
try {
  require('dotenv').config({
    // Educational Note: Look for .env file in project root
    path: path.resolve(process.cwd(), '.env')
  });
} catch (error) {
  console.warn('⚠️ Could not load .env file:', error.message);
  console.warn('📚 Educational Note: Create a .env file from .env.example');
}

/**
 * Educational Function: Validate required environment variables
 * 
 * This function demonstrates configuration validation patterns
 * and helps students understand which settings are critical.
 * 
 * @param {string[]} requiredVars - Array of required variable names
 * @throws {Error} If any required variable is missing
 */
function validateRequiredEnvVars(requiredVars) {
  const missingVars = requiredVars.filter(varName => {
    const value = process.env[varName];
    return !value || value.trim() === '';
  });
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('');
    console.error('📚 Educational Solution:');
    console.error('   1. Copy .env.example to .env');
    console.error('   2. Fill in the missing variable values');
    console.error('   3. Restart the application');
    console.error('');
    
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  console.log('✅ All required environment variables are present');
}

/**
 * Educational Function: Parse boolean environment variable
 * 
 * Demonstrates string-to-boolean conversion for environment variables
 * 
 * @param {string} value - String value from environment
 * @param {boolean} defaultValue - Default if value is undefined
 * @returns {boolean} Parsed boolean value
 */
function parseBoolean(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  
  // Educational Note: Accept various true/false representations
  const truthyValues = ['true', '1', 'yes', 'on', 'enabled'];
  const falsyValues = ['false', '0', 'no', 'off', 'disabled'];
  
  const normalizedValue = value.toString().toLowerCase().trim();
  
  if (truthyValues.includes(normalizedValue)) return true;
  if (falsyValues.includes(normalizedValue)) return false;
  
  console.warn(`⚠️ Invalid boolean value: "${value}". Using default: ${defaultValue}`);
  return defaultValue;
}

/**
 * Educational Function: Parse integer environment variable
 * 
 * Demonstrates string-to-number conversion with validation
 * 
 * @param {string} value - String value from environment
 * @param {number} defaultValue - Default if value is invalid
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} Parsed integer value
 */
function parseInteger(value, defaultValue = 0, min = null, max = null) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  
  const parsed = parseInt(value, 10);
  
  if (isNaN(parsed)) {
    console.warn(`⚠️ Invalid integer value: "${value}". Using default: ${defaultValue}`);
    return defaultValue;
  }
  
  if (min !== null && parsed < min) {
    console.warn(`⚠️ Value ${parsed} is below minimum ${min}. Using minimum.`);
    return min;
  }
  
  if (max !== null && parsed > max) {
    console.warn(`⚠️ Value ${parsed} is above maximum ${max}. Using maximum.`);
    return max;
  }
  
  return parsed;
}

/**
 * Educational Function: Get environment type
 * 
 * Determines the current environment with fallback logic
 * 
 * @returns {string} Environment name
 */
function getEnvironment() {
  const env = process.env.NODE_ENV || 'development';
  const validEnvironments = ['development', 'test', 'production'];
  
  if (!validEnvironments.includes(env)) {
    console.warn(`⚠️ Unknown environment "${env}". Defaulting to development.`);
    return 'development';
  }
  
  return env;
}

/**
 * Educational Function: Create configuration object
 * 
 * This demonstrates the configuration object pattern used in many Node.js applications
 * 
 * @returns {Object} Complete application configuration
 */
function createConfig() {
  console.log('⚙️ Loading application configuration...');
  
  // Educational Note: Determine environment first
  const environment = getEnvironment();
  const isProduction = environment === 'production';
  const isDevelopment = environment === 'development';
  const isTest = environment === 'test';
  
  console.log(`🌟 Environment: ${environment}`);
  
  // Educational Note: Define required variables based on environment
  const requiredVars = [
    'AZURE_OPENAI_API_KEY',
    'AZURE_OPENAI_ENDPOINT',
  ];
  
  // Educational Note: Only validate required vars in production
  if (isProduction) {
    validateRequiredEnvVars(requiredVars);
  }
  
  // Educational Note: Create comprehensive configuration object
  const config = {
    // Environment information
    environment: {
      name: environment,
      isProduction,
      isDevelopment,
      isTest,
      nodeVersion: process.version
    },
    
    // Server configuration
    server: {
      port: parseInteger(process.env.PORT, 3001, 3000, 65535),
      host: process.env.HOST || 'localhost',
      timeout: parseInteger(process.env.SERVER_TIMEOUT, 30000, 1000, 300000), // 30s default
      keepAliveTimeout: parseInteger(process.env.KEEP_ALIVE_TIMEOUT, 5000),
    },
    
    // Database configuration  
    database: {
      url: process.env.DATABASE_URL || 'sqlite:./data/rescan.db',
      filename: process.env.DATABASE_URL?.replace('sqlite:', '') || './data/rescan.db',
      options: {
        verbose: parseBoolean(process.env.DB_VERBOSE, isDevelopment),
        foreignKeys: parseBoolean(process.env.DB_FOREIGN_KEYS, true),
      }
    },
    
    // Azure OpenAI configuration
    ai: {
      azure: {
        apiKey: process.env.AZURE_OPENAI_API_KEY || '',
        endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
        deployment: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o',
        apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-01',
        maxTokens: parseInteger(process.env.AZURE_OPENAI_MAX_TOKENS, 1000, 1, 8000),
        timeout: parseInteger(process.env.AZURE_OPENAI_TIMEOUT, 30000, 5000, 120000),
      }
    },
    
    // Security configuration
    security: {
      corsOrigins: process.env.CORS_ORIGINS ? 
        process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()) : 
        ['http://localhost:3000', 'http://localhost:5500'],
      rateLimitWindowMs: parseInteger(process.env.RATE_LIMIT_WINDOW_MS, 900000), // 15 min
      rateLimitMax: parseInteger(process.env.RATE_LIMIT_MAX, 100), // 100 requests per window
      maxFileSize: parseInteger(process.env.MAX_FILE_SIZE, 10 * 1024 * 1024), // 10MB
    },
    
    // Educational features
    educational: {
      enabled: parseBoolean(process.env.EDUCATIONAL_MODE, isDevelopment),
      verboseLogging: parseBoolean(process.env.VERBOSE_LOGGING, isDevelopment),
      debugMode: parseBoolean(process.env.DEBUG_MODE, isDevelopment),
      showStackTraces: parseBoolean(process.env.SHOW_STACK_TRACES, isDevelopment),
    },
    
    // File upload configuration
    uploads: {
      directory: process.env.UPLOAD_DIR || './backend/public/uploads',
      maxSize: parseInteger(process.env.MAX_UPLOAD_SIZE, 5 * 1024 * 1024), // 5MB
      allowedExtensions: process.env.ALLOWED_EXTENSIONS ? 
        process.env.ALLOWED_EXTENSIONS.split(',').map(ext => ext.trim()) :
        ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      cleanupOldFiles: parseBoolean(process.env.CLEANUP_OLD_FILES, true),
      maxAge: parseInteger(process.env.UPLOAD_MAX_AGE, 7 * 24 * 60 * 60 * 1000), // 7 days
    },
    
    // Logging configuration
    logs: {
      level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
      file: process.env.LOG_FILE || null, // null means console only
      maxSize: process.env.LOG_MAX_SIZE || '100MB',
      maxFiles: parseInteger(process.env.LOG_MAX_FILES, 10),
    }
  };
  
  // Educational Note: Validate critical configuration
  validateConfiguration(config);
  
  return config;
}

/**
 * Educational Function: Validate configuration object
 * 
 * Performs post-processing validation to catch configuration errors
 * 
 * @param {Object} config - Configuration object to validate
 * @throws {Error} If configuration is invalid
 */
function validateConfiguration(config) {
  const errors = [];
  
  // Educational Note: Validate server configuration
  if (config.server.port < 3000 || config.server.port > 65535) {
    errors.push(`Invalid server port: ${config.server.port}`);
  }
  
  // Educational Note: Validate AI configuration in production
  if (config.environment.isProduction) {
    if (!config.ai.azure.apiKey) {
      errors.push('Azure OpenAI API key is required in production');
    }
    
    if (!config.ai.azure.endpoint) {
      errors.push('Azure OpenAI endpoint is required in production');
    }
  }
  
  // Educational Note: Validate upload configuration
  if (config.uploads.maxSize > 100 * 1024 * 1024) { // 100MB
    console.warn('⚠️ Upload max size is very large. Consider reducing for security.');
  }
  
  if (errors.length > 0) {
    console.error('❌ Configuration validation failed:');
    errors.forEach(error => console.error(`   - ${error}`));
    throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
  }
  
  console.log('✅ Configuration validation passed');
}

/**
 * Educational Function: Log configuration summary
 * 
 * Displays configuration information for educational debugging
 * (Careful not to log sensitive information!)
 * 
 * @param {Object} config - Configuration to summarize
 */
function logConfigSummary(config) {
  if (!config.educational.enabled) {
    return;
  }
  
  console.log('\n📋 Configuration Summary:');
  console.log(`   🌟 Environment: ${config.environment.name}`);
  console.log(`   🚀 Server: ${config.server.host}:${config.server.port}`);
  console.log(`   🗃️ Database: ${config.database.filename}`);
  console.log(`   📁 Uploads: ${config.uploads.directory}`);
  console.log(`   🎓 Educational Mode: ${config.educational.enabled ? 'ON' : 'OFF'}`);
  console.log(`   🔍 Debug Mode: ${config.educational.debugMode ? 'ON' : 'OFF'}`);
  
  // Educational Note: Don't log sensitive information
  const hasAzureKey = config.ai.azure.apiKey ? 'YES (hidden)' : 'NO';
  console.log(`   🤖 AI Configured: ${hasAzureKey}`);
  console.log('');
}

// Educational Note: Create and export the configuration
console.log('🔧 Initializing application configuration...');

let config;
try {
  config = createConfig();
  logConfigSummary(config);
  console.log('✅ Configuration loaded successfully!\n');
} catch (error) {
  console.error('💥 Failed to load configuration:', error.message);
  console.error('🚨 Application cannot continue without valid configuration');
  process.exit(1);
}

// Educational Export: Make configuration available throughout the application
module.exports = {
  // Main configuration object
  config,
  
  // Utility functions for testing and debugging
  createConfig,
  validateConfiguration,
  parseBoolean,
  parseInteger,
  getEnvironment,
  
  // Educational helpers
  requiredVars: ['AZURE_OPENAI_API_KEY', 'AZURE_OPENAI_ENDPOINT'],
  
  // Environment checkers
  isDevelopment: config.environment.isDevelopment,
  isProduction: config.environment.isProduction,
  isTest: config.environment.isTest,
  
  // Quick access to common config values
  port: config.server.port,
  dbPath: config.database.filename,
  uploadDir: config.uploads.directory,
};

// Educational Note: Export specific configs for convenience
module.exports.server = config.server;
module.exports.database = config.database;
module.exports.ai = config.ai;
module.exports.security = config.security;
module.exports.educational = config.educational;