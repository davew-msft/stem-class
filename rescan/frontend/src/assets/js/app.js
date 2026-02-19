/**
 * Educational JavaScript: Main Application Script
 * 
 * Shared functionality for the Rescan educational recycling application
 * Learn about: modular JavaScript, application state, cross-page functionality
 */

/**
 * Educational Object: Application Configuration
 * 
 * Central configuration for the application
 * Learn about: configuration management, application constants
 */
const AppConfig = {
    // Educational Note: API endpoints
    api: {
        baseUrl: '/api',
        endpoints: {
            addressLookup: '/address/lookup',
            addressCreate: '/address',
            addressUpdate: '/address/points'
        }
    },
    
    // Educational Note: Default settings
    settings: {
        animationDuration: 300,
        loadingDelay: 500,
        maxAddressLength: 255,
        minAddressLength: 5
    },
    
    // Educational Note: Educational content for debug mode
    debug: {
        enabled: true, // Set to false in production
        logLevel: 'info' // info, warn, error
    }
};

/**
 * Educational Object: Utility Functions
 * 
 * Reusable utility functions across the application
 * Learn about: utility functions, code reusability, helper methods
 */
const AppUtils = {
    /**
     * Educational Function: Safe Console Logging
     * 
     * Provides educational logging with conditional output
     * Learn about: console methods, debugging, conditional execution
     */
    log: (message, level = 'info', data = null) => {
        if (!AppConfig.debug.enabled) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
        
        switch (level) {
            case 'error':
                console.error(`${prefix} ${message}`, data || '');
                break;
            case 'warn':
                console.warn(`${prefix} ${message}`, data || '');
                break;
            case 'info':
            default:
                console.log(`${prefix} ${message}`, data || '');
        }
    },

    /**
     * Educational Function: Validate Address Input
     * 
     * Centralized address validation logic
     * Learn about: validation patterns, regular expressions, data sanitization
     */
    validateAddress: (address) => {
        // Educational Note: Input sanitization
        const cleanAddress = address ? address.trim() : '';
        
        // Educational Note: Validation checks
        if (!cleanAddress) {
            return { valid: false, error: 'Address cannot be empty' };
        }
        
        if (cleanAddress.length < AppConfig.settings.minAddressLength) {
            return { 
                valid: false, 
                error: `Address must be at least ${AppConfig.settings.minAddressLength} characters` 
            };
        }
        
        if (cleanAddress.length > AppConfig.settings.maxAddressLength) {
            return { 
                valid: false, 
                error: `Address must be less than ${AppConfig.settings.maxAddressLength} characters` 
            };
        }
        
        // Educational Note: Pattern validation for reasonable address format
        const addressPattern = /^[a-zA-Z0-9\s,.\-#]+$/;
        if (!addressPattern.test(cleanAddress)) {
            return { 
                valid: false, 
                error: 'Address contains invalid characters' 
            };
        }
        
        return { valid: true, address: cleanAddress };
    },

    /**
     * Educational Function: Format Points Display
     * 
     * Consistent points formatting across the application
     * Learn about: number formatting, data presentation, user experience
     */
    formatPoints: (points) => {
        if (typeof points !== 'number') return '0';
        
        // Educational Note: Add thousand separators for readability
        return points.toLocaleString();
    },

    /**
     * Educational Function: Smooth Scroll to Element
     * 
     * Provides smooth scrolling with educational feedback
     * Learn about: DOM manipulation, animation, user experience
     */
    scrollToElement: (element, options = {}) => {
        if (!element) {
            AppUtils.log('Scroll target element not found', 'warn');
            return;
        }
        
        const defaultOptions = {
            behavior: 'smooth',
            block: 'start',
            ...options
        };
        
        AppUtils.log(`Scrolling to element: ${element.tagName}${element.id ? '#' + element.id : ''}${element.className ? '.' + element.className.split(' ')[0] : ''}`);
        element.scrollIntoView(defaultOptions);
    },

    /**
     * Educational Function: Show/Hide Loading State
     * 
     * Centralized loading state management
     * Learn about: state management, user feedback, asynchronous operations
     */
    setLoadingState: (element, isLoading, loadingText = 'Loading...') => {
        if (!element) return;
        
        if (isLoading) {
            element.dataset.originalText = element.innerHTML;
            element.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingText}`;
            element.disabled = true;
            AppUtils.log(`Loading state activated for element: ${element.tagName}`);
        } else {
            element.innerHTML = element.dataset.originalText || element.innerHTML;
            element.disabled = false;
            AppUtils.log(`Loading state deactivated for element: ${element.tagName}`);
        }
    },

    /**
     * Educational Function: Create Error Display
     * 
     * Standardized error message creation
     * Learn about: error handling, user communication, accessibility
     */
    createErrorElement: (message, type = 'error') => {
        const errorDiv = document.createElement('div');
        errorDiv.className = `alert alert-${type}`;
        errorDiv.setAttribute('role', 'alert');
        errorDiv.setAttribute('aria-live', 'polite');
        
        errorDiv.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'info-circle'}" aria-hidden="true"></i>
            ${message}
        `;
        
        return errorDiv;
    }
};

/**
 * Educational Object: Navigation Manager
 * 
 * Handles cross-page navigation and routing
 * Learn about: navigation patterns, history management, page transitions
 */
const Navigation = {
    /**
     * Educational Function: Navigate to Page
     * 
     * Provides page navigation with loading states and validation
     * Learn about: page routing, validation, user experience
     */
    goToPage: (pageUrl, options = {}) => {
        const { 
            validateBeforeNav = false, 
            showLoading = true, 
            delay = AppConfig.settings.loadingDelay 
        } = options;
        
        AppUtils.log(`Navigating to: ${pageUrl}`);
        
        if (showLoading && delay > 0) {
            // Educational Note: Show brief loading state for better UX
            setTimeout(() => {
                window.location.href = pageUrl;
            }, delay);
        } else {
            window.location.href = pageUrl;
        }
    },

    /**
     * Educational Function: Go to Home Page
     * 
     * Navigate to application home page
     * Learn about: home navigation, user flow
     */
    goHome: (showLoading = true) => {
        Navigation.goToPage('home.html', { showLoading });
    },

    /**
     * Educational Function: Go to Login/Address Entry
     * 
     * Navigate to address entry page
     * Learn about: user flow, conversion paths
     */
    goToLogin: (showLoading = true) => {
        Navigation.goToPage('login.html', { showLoading });
    },

    /**
     * Educational Function: Go to Scanning Page
     * 
     * Navigate to scanning functionality (placeholder for future implementation)
     * Learn about: feature progression, placeholder development
     */
    goToScan: (showLoading = true) => {
        // TODO: Implement in User Story 2
        AppUtils.log('Scan page navigation - to be implemented in User Story 2', 'info');
        
        // Educational Note: For now, show informational message
        alert('🔬 Scan functionality is coming in User Story 2!\n\nThis will include:\n• Camera integration\n• AI image analysis\n• Material identification\n• Points earning system');
    }
};

/**
 * Educational Object: API Helper
 * 
 * Centralized API communication functionality
 * Learn about: API integration, error handling, async patterns
 */
const ApiHelper = {
    /**
     * Educational Function: Make API Request
     * 
     * Generic API request wrapper with error handling
     * Learn about: fetch API, error handling, async/await
     */
    request: async (endpoint, options = {}) => {
        const {
            method = 'GET',
            headers = {},
            body = null,
            timeout = 10000
        } = options;
        
        const url = `${AppConfig.api.baseUrl}${endpoint}`;
        AppUtils.log(`API Request: ${method} ${url}`);
        
        const requestOptions = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            ...( body && { body: JSON.stringify(body) })
        };
        
        try {
            // Educational Note: Add timeout for better error handling
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            const response = await fetch(url, {
                ...requestOptions,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            AppUtils.log(`API Response received for ${method} ${url}`, 'info', data);
            
            return { success: true, data };
            
        } catch (error) {
            AppUtils.log(`API Error for ${method} ${url}`, 'error', error);
            
            // Educational Note: Provide user-friendly error messages
            let userMessage = 'A network error occurred. Please check your connection and try again.';
            
            if (error.name === 'AbortError') {
                userMessage = 'Request timed out. Please try again.';
            } else if (error.message.includes('404')) {
                userMessage = 'The requested information was not found.';
            } else if (error.message.includes('500')) {
                userMessage = 'A server error occurred. Please try again later.';
            }
            
            return { success: false, error: userMessage, details: error };
        }
    },

    /**
     * Educational Function: Lookup Address
     * 
     * Specific API call for address lookup functionality
     * Learn about: specific API patterns, query parameters
     */
    lookupAddress: async (streetAddress) => {
        const encodedAddress = encodeURIComponent(streetAddress);
        return ApiHelper.request(`${AppConfig.api.endpoints.addressLookup}?street_address=${encodedAddress}`);
    }
};

/**
 * Educational Object: Application State
 * 
 * Manages application-wide state and user session data
 * Learn about: state management, session storage, data persistence
 */
const AppState = {
    // Educational Note: Current session data
    currentAddress: null,
    currentPoints: 0,
    isNewUser: false,
    
    /**
     * Educational Function: Set User Address
     * 
     * Updates current user address info
     * Learn about: state updates, data synchronization
     */
    setUserAddress: (addressData) => {
        AppState.currentAddress = addressData.address;
        AppState.currentPoints = addressData.points_total || 0;
        AppState.isNewUser = !addressData.exists;
        
        AppUtils.log('User address updated in state', 'info', {
            address: AppState.currentAddress,
            points: AppState.currentPoints,
            isNew: AppState.isNewUser
        });
        
        // Educational Note: Store in sessionStorage for persistence during session
        try {
            sessionStorage.setItem('userAddress', JSON.stringify({
                address: AppState.currentAddress,
                points: AppState.currentPoints,
                isNew: AppState.isNewUser,
                timestamp: Date.now()
            }));
        } catch (error) {
            AppUtils.log('Failed to store user data in sessionStorage', 'warn', error);
        }
    },

    /**
     * Educational Function: Load User Data
     * 
     * Loads user data from session storage if available
     * Learn about: data persistence, session management
     */
    loadUserData: () => {
        try {
            const stored = sessionStorage.getItem('userAddress');
            if (stored) {
                const userData = JSON.parse(stored);
                
                // Educational Note: Check if data is recent (within last hour)
                const oneHour = 60 * 60 * 1000;
                if (Date.now() - userData.timestamp < oneHour) {
                    AppState.currentAddress = userData.address;
                    AppState.currentPoints = userData.points;
                    AppState.isNewUser = userData.isNew;
                    
                    AppUtils.log('User data loaded from session', 'info', userData);
                    return true;
                }
            }
        } catch (error) {
            AppUtils.log('Failed to load user data from sessionStorage', 'warn', error);
        }
        
        return false;
    },

    /**
     * Educational Function: Clear User Data
     * 
     * Clears current user session data
     * Learn about: data cleanup, session management
     */
    clearUserData: () => {
        AppState.currentAddress = null;
        AppState.currentPoints = 0;
        AppState.isNewUser = false;
        
        try {
            sessionStorage.removeItem('userAddress');
        } catch (error) {
            AppUtils.log('Failed to clear user data from sessionStorage', 'warn', error);
        }
        
        AppUtils.log('User data cleared from state');
    }
};

/**
 * Educational Function: Initialize Application
 * 
 * Main initialization function called when DOM is ready
 * Learn about: application initialization, event binding, setup patterns
 */
function initializeApp() {
    AppUtils.log('🚀 Rescan Educational Application Starting...');
    AppUtils.log('Educational Mode: Enabled', 'info', AppConfig);
    
    // Educational Note: Load any existing user data
    if (AppState.loadUserData()) {
        AppUtils.log('Previous session data restored');
    }
    
    // Educational Note: Set up global error handling for educational purposes
    window.addEventListener('error', function(event) {
        AppUtils.log('Global JavaScript Error', 'error', {
            message: event.message,
            filename: event.filename,
            line: event.lineno,
            column: event.colno
        });
    });
    
    // Educational Note: Set up global navigation event handling
    document.addEventListener('click', function(event) {
        // Educational Note: Handle navigation buttons with data attributes
        if (event.target.dataset.navigate) {
            event.preventDefault();
            const destination = event.target.dataset.navigate;
            AppUtils.log(`Navigation triggered via data attribute: ${destination}`);
            
            switch (destination) {
                case 'home':
                    Navigation.goHome();
                    break;
                case 'login':
                    Navigation.goToLogin();
                    break;
                case 'scan':
                    Navigation.goToScan();
                    break;
                default:
                    AppUtils.log(`Unknown navigation destination: ${destination}`, 'warn');
            }
        }
    });
    
    AppUtils.log('✅ Application initialization complete');
    
    // Educational Note: Announce successful load to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = 'Rescan application loaded successfully. Ready for recycling education.';
    document.body.appendChild(announcement);
}

// Educational Note: Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // Educational Note: DOM is already ready, initialize immediately
    initializeApp();
}

// Educational Note: Export objects for potential module use or debugging
if (typeof window !== 'undefined') {
    window.AppConfig = AppConfig;
    window.AppUtils = AppUtils;
    window.Navigation = Navigation;
    window.ApiHelper = ApiHelper;
    window.AppState = AppState;
}