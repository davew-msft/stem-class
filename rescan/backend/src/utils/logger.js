/**
 * Educational Logging Utility for Rescan Recycling Application
 * 
 * This module demonstrates logging best practices for educational purposes:
 * - Console logging with formatting
 * - Log levels and categorization  
 * - Structured logging for debugging
 * - Educational development patterns
 * 
 * Learning Objectives:
 * - Understand application logging concepts
 * - Learn about debugging and maintenance
 * - Practice utility module patterns
 * - Explore console formatting techniques
 */

/**
 * Educational Logger Class
 * 
 * Provides structured logging with educational context
 * Learn about: singleton patterns, log levels, formatting
 */
class EducationalLogger {
    constructor() {
        this.levels = {
            ERROR: 0,
            WARN: 1,
            INFO: 2,
            DEBUG: 3
        };
        
        this.colors = {
            reset: '\x1b[0m',
            red: '\x1b[31m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            green: '\x1b[32m',
            cyan: '\x1b[36m',
            magenta: '\x1b[35m'
        };
        
        this.currentLevel = process.env.LOG_LEVEL || 'INFO';
        this.isDevelopment = process.env.NODE_ENV !== 'production';
    }
    
    /**
     * Educational Method: Get Timestamp
     * 
     * Creates formatted timestamp for log entries
     * Learn about: Date formatting, ISO strings, timezone handling
     */
    getTimestamp() {
        return new Date().toISOString();
    }
    
    /**
     * Educational Method: Format Message
     * 
     * Applies color coding and structure to log messages
     * Learn about: string formatting, console colors, template literals
     */
    formatMessage(level, message, context = {}) {
        const timestamp = this.getTimestamp();
        const colorCode = this.getColorForLevel(level);
        const resetCode = this.colors.reset;
        
        // Educational Note: Structured log format
        let formatted = `${colorCode}[${timestamp}] ${level}${resetCode}: ${message}`;
        
        // Educational Note: Add context if provided
        if (Object.keys(context).length > 0) {
            formatted += `\n${colorCode}Context:${resetCode} ${JSON.stringify(context, null, 2)}`;
        }
        
        return formatted;
    }
    
    /**
     * Educational Method: Get Color for Level
     * 
     * Maps log levels to console colors for visual distinction
     * Learn about: color mapping, console formatting, visual debugging
     */
    getColorForLevel(level) {
        switch(level) {
            case 'ERROR': return this.colors.red;
            case 'WARN': return this.colors.yellow;
            case 'INFO': return this.colors.blue;
            case 'DEBUG': return this.colors.cyan;
            default: return this.colors.reset;
        }
    }
    
    /**
     * Educational Method: Should Log
     * 
     * Determines if message should be logged based on current level
     * Learn about: log level filtering, conditional logging, performance
     */
    shouldLog(level) {
        const levelValue = this.levels[level];
        const currentLevelValue = this.levels[this.currentLevel];
        return levelValue <= currentLevelValue;
    }
    
    /**
     * Educational Method: Error Logging
     * 
     * Logs error messages with stack traces and context
     * Learn about: error handling, debugging, stack traces
     */
    error(message, error = null, context = {}) {
        if (!this.shouldLog('ERROR')) return;
        
        const errorContext = {
            ...context,
            timestamp: this.getTimestamp(),
            educational: {
                concept: 'Error Logging',
                purpose: 'Track and debug application errors for learning'
            }
        };
        
        if (error) {
            errorContext.errorMessage = error.message;
            errorContext.errorStack = error.stack;
        }
        
        console.error(this.formatMessage('ERROR', message, errorContext));
        
        // Educational Note: Log to console.error for stack traces
        if (error && this.isDevelopment) {
            console.error('Full Error Object:', error);
        }
    }
    
    /**
     * Educational Method: Warning Logging
     * 
     * Logs warning messages for potential issues
     * Learn about: proactive monitoring, warning systems, best practices
     */
    warn(message, context = {}) {
        if (!this.shouldLog('WARN')) return;
        
        const warningContext = {
            ...context,
            timestamp: this.getTimestamp(),
            educational: {
                concept: 'Warning Logging',
                purpose: 'Identify potential issues before they become errors'
            }
        };
        
        console.warn(this.formatMessage('WARN', message, warningContext));
    }
    
    /**
     * Educational Method: Info Logging
     * 
     * Logs informational messages for application flow
     * Learn about: application monitoring, user feedback, operational insight
     */
    info(message, context = {}) {
        if (!this.shouldLog('INFO')) return;
        
        const infoContext = {
            ...context,
            timestamp: this.getTimestamp(),
            educational: {
                concept: 'Info Logging',
                purpose: 'Track normal application operations and user actions'
            }
        };
        
        console.info(this.formatMessage('INFO', message, infoContext));
    }
    
    /**
     * Educational Method: Debug Logging
     * 
     * Logs detailed debug information for development
     * Learn about: development debugging, detailed tracing, performance monitoring
     */
    debug(message, context = {}) {
        if (!this.shouldLog('DEBUG')) return;
        
        const debugContext = {
            ...context,
            timestamp: this.getTimestamp(),
            educational: {
                concept: 'Debug Logging',
                purpose: 'Detailed application flow for development and troubleshooting'
            }
        };
        
        console.debug(this.formatMessage('DEBUG', message, debugContext));
    }
    
    /**
     * Educational Method: Log Request
     * 
     * Specialized logging for HTTP requests
     * Learn about: web server logging, request tracking, performance monitoring
     */
    logRequest(req, res = null, context = {}) {
        const requestContext = {
            method: req.method,
            url: req.url,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            timestamp: this.getTimestamp(),
            ...context,
            educational: {
                concept: 'Request Logging',
                purpose: 'Monitor HTTP requests for debugging and analytics'
            }
        };
        
        if (res) {
            requestContext.statusCode = res.statusCode;
        }
        
        this.info(`HTTP Request: ${req.method} ${req.url}`, requestContext);
    }
    
    /**
     * Educational Method: Log Database Operation
     * 
     * Specialized logging for database operations
     * Learn about: database monitoring, query performance, data operations
     */
    logDatabase(operation, table = null, context = {}) {
        const dbContext = {
            operation,
            table,
            timestamp: this.getTimestamp(),
            ...context,
            educational: {
                concept: 'Database Logging',
                purpose: 'Monitor database operations for performance and debugging'
            }
        };
        
        this.debug(`Database Operation: ${operation}${table ? ` on ${table}` : ''}`, dbContext);
    }
    
    /**
     * Educational Method: Log AI Operation
     * 
     * Specialized logging for AI service interactions
     * Learn about: external service monitoring, API tracking, AI debugging
     */
    logAI(operation, model = null, context = {}) {
        const aiContext = {
            operation,
            model,
            timestamp: this.getTimestamp(),
            ...context,
            educational: {
                concept: 'AI Service Logging',
                purpose: 'Monitor AI service interactions and performance'
            }
        };
        
        this.info(`AI Operation: ${operation}${model ? ` using ${model}` : ''}`, aiContext);
    }
}

/**
 * Educational Export: Logger Instance
 * 
 * Creates singleton logger instance for application-wide use
 * Learn about: singleton pattern, module exports, shared resources
 */
const logger = new EducationalLogger();

// Educational Note: Log logger initialization
if (logger.isDevelopment) {
    logger.info('Educational Logger Initialized', {
        level: logger.currentLevel,
        environment: process.env.NODE_ENV || 'development',
        features: ['Color Coding', 'Structured Logging', 'Educational Context']
    });
}

module.exports = logger;