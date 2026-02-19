/**
 * Educational Component: Image Upload and AI Analysis
 * 
 * Handles file uploads, drag-and-drop interface, AI analysis communication,
 * and results display with comprehensive educational feedback.
 * 
 * Learning Objectives:
 * - File handling and validation in the browser
 * - Drag and drop API implementation
 * - Asynchronous API communication patterns
 * - Error handling and user feedback
 * - DOM manipulation and dynamic content
 * - Progress indication and user experience
 */

class UploadComponent {
    constructor(config) {
        // Educational Note: Configuration injection pattern for flexibility
        this.config = config;
        this.currentFile = null;
        this.currentAnalysis = null;
        this.isAnalyzing = false;
        
        // Educational Note: Initialize component
        this.init();
    }
    
    /**
     * Educational Method: Component Initialization
     * Sets up event listeners and initial state
     */
    init() {
        console.log('🎓 Educational: Initializing UploadComponent with drag-and-drop support');
        
        // Educational Note: Validate configuration
        if (!this.validateConfig()) {
            console.error('❌ UploadComponent configuration invalid');
            return;
        }
        
        // Educational Note: Setup event listeners
        this.setupEventListeners();
        
        // Educational Note: Initialize component state
        this.resetInterface();
        
        console.log('✅ UploadComponent initialized successfully');
    }
    
    /**
     * Educational Method: Configuration Validation
     * Ensures all required DOM elements are available
     */
    validateConfig() {
        const requiredElements = [
            'uploadArea', 'fileInput', 'previewContainer', 
            'imagePreview', 'analyzeBtn', 'removeBtn'
        ];
        
        for (const elementKey of requiredElements) {
            if (!this.config[elementKey]) {
                console.error(`❌ Required element missing: ${elementKey}`);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Educational Method: Event Listener Setup
     * Comprehensive event handling for upload interface
     */
    setupEventListeners() {
        // Educational Note: File input change event
        this.config.fileInput.addEventListener('change', (e) => {
            console.log('📁 File input changed');
            this.handleFileSelection(e.target.files[0]);
        });
        
        // Educational Note: Upload area click to trigger file selection
        this.config.uploadArea.addEventListener('click', () => {
            console.log('🖱️ Upload area clicked');
            this.config.fileInput.click();
        });
        
        // Educational Note: Drag and drop events
        this.setupDragAndDrop();
        
        // Educational Note: Button event listeners
        this.config.analyzeBtn.addEventListener('click', () => {
            console.log('🧠 Analyze button clicked');
            this.startAnalysis();
        });
        
        this.config.removeBtn.addEventListener('click', () => {
            console.log('🗑️ Remove button clicked');
            this.removeImage();
        });
        
        // Educational Note: Keyboard accessibility
        this.config.uploadArea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.config.fileInput.click();
            }
        });
        
        // Educational Note: Make upload area focusable for accessibility
        this.config.uploadArea.setAttribute('tabindex', '0');
        this.config.uploadArea.setAttribute('role', 'button');
        this.config.uploadArea.setAttribute('aria-label', 'Click to select image file');
    }
    
    /**
     * Educational Method: Drag and Drop Setup
     * Modern drag and drop API implementation
     */
    setupDragAndDrop() {
        const uploadArea = this.config.uploadArea;
        
        // Educational Note: Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, this.preventDefaults);
            document.body.addEventListener(eventName, this.preventDefaults);
        });
        
        // Educational Note: Drag enter and over events
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                console.log('📥 Drag over detected');
                uploadArea.classList.add('dragging');
            });
        });
        
        // Educational Note: Drag leave event
        uploadArea.addEventListener('dragleave', () => {
            console.log('📤 Drag leave detected');
            uploadArea.classList.remove('dragging');
        });
        
        // Educational Note: Drop event
        uploadArea.addEventListener('drop', (e) => {
            console.log('📨 File dropped');
            uploadArea.classList.remove('dragging');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelection(files[0]);
            }
        });
    }
    
    /**
     * Educational Method: Prevent Default Events
     * Helper to prevent browser default drag behaviors
     */
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    /**
     * Educational Method: File Selection Handler
     * Validates and processes selected files
     */
    handleFileSelection(file) {
        console.log(`📄 File selected: ${file?.name}, Size: ${file?.size} bytes`);
        
        // Educational Note: File validation
        const validation = this.validateFile(file);
        if (!validation.valid) {
            this.showError(validation.message);
            return;
        }
        
        // Educational Note: Store current file
        this.currentFile = file;
        
        // Educational Note: Create image preview
        this.createImagePreview(file);
        
        // Educational Note: Update interface state
        this.showPreviewInterface();
        
        // Educational Note: Clear any previous errors
        this.hideError();
        
        console.log('✅ File processed successfully');
    }
    
    /**
     * Educational Method: File Validation
     * Comprehensive file type and size validation
     */
    validateFile(file) {
        // Educational Note: Check if file exists
        if (!file) {
            return {
                valid: false,
                message: 'No file selected. Please choose an image file.'
            };
        }
        
        // Educational Note: File type validation
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                message: `Invalid file type: ${file.type}. Please use JPEG, PNG, or WebP images.`
            };
        }
        
        // Educational Note: File size validation (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            return {
                valid: false,
                message: `File too large: ${sizeMB}MB. Please use images smaller than 10MB.`
            };
        }
        
        // Educational Note: File size minimum (prevent tiny images)
        const minSize = 1024; // 1KB minimum
        if (file.size < minSize) {
            return {
                valid: false,
                message: 'File too small. Please use a larger image for better analysis.'
            };
        }
        
        return {
            valid: true,
            message: 'File validation passed'
        };
    }
    
    /**
     * Educational Method: Image Preview Creation
     * Creates preview using FileReader API
     */
    createImagePreview(file) {
        console.log('🖼️ Creating image preview');
        
        // Educational Note: Use FileReader API for local file reading
        const reader = new FileReader();
        
        reader.onload = (e) => {
            console.log('✅ Image loaded for preview');
            this.config.imagePreview.src = e.target.result;
            this.config.imagePreview.alt = `Preview of ${file.name}`;
        };
        
        reader.onerror = () => {
            console.error('❌ Error reading file for preview');
            this.showError('Unable to preview image. Please try a different file.');
        };
        
        // Educational Note: Read file as data URL for preview
        reader.readAsDataURL(file);
    }
    
    /**
     * Educational Method: Interface State Management
     * Shows preview interface and hides upload area
     */
    showPreviewInterface() {
        console.log('👁️ Showing preview interface');
        
        // Educational Note: Hide upload area
        this.config.uploadArea.style.display = 'none';
        
        // Educational Note: Show preview container
        this.config.previewContainer.style.display = 'block';
        
        // Educational Note: Enable analyze button
        this.config.analyzeBtn.disabled = false;
        
        // Educational Note: Optional: Update page title
        document.title = `Rescan - Image Ready | ${this.currentFile.name}`;
    }
    
    /**
     * Educational Method: Remove Image
     * Resets interface to initial upload state
     */
    removeImage() {
        console.log('🗑️ Removing current image');
        
        // Educational Note: Reset component state
        this.currentFile = null;
        this.currentAnalysis = null;
        
        // Educational Note: Clear file input
        this.config.fileInput.value = '';
        
        // Educational Note: Clear image preview
        this.config.imagePreview.src = '';
        this.config.imagePreview.alt = '';
        
        // Educational Note: Reset interface
        this.resetInterface();
        
        console.log('✅ Image removed successfully');
    }
    
    /**
     * Educational Method: Reset Interface
     * Returns to initial upload state
     */
    resetInterface() {
        console.log('🔄 Resetting interface to initial state');
        
        // Educational Note: Show upload area
        this.config.uploadArea.style.display = 'block';
        
        // Educational Note: Hide preview and analysis sections
        this.config.previewContainer.style.display = 'none';
        if (this.config.analysisSection) {
            this.config.analysisSection.style.display = 'none';
        }
        if (this.config.analysisResult) {
            this.config.analysisResult.style.display = 'none';
        }
        
        // Educational Note: Disable buttons
        this.config.analyzeBtn.disabled = true;
        
        // Educational Note: Clear any errors
        this.hideError();
        
        // Educational Note: Reset page title
        document.title = 'Rescan - AI Image Analysis | Scan & Learn';
        
        console.log('✅ Interface reset complete');
    }
    
    /**
     * Educational Method: Start Analysis
     * Initiates AI analysis process with progress tracking
     */
    async startAnalysis() {
        if (!this.currentFile || this.isAnalyzing) {
            console.warn('⚠️ Cannot start analysis: no file or already analyzing');
            return;
        }
        
        console.log('🧠 Starting AI analysis process');
        
        try {
            // Educational Note: Set analyzing state
            this.isAnalyzing = true;
            this.config.analyzeBtn.disabled = true;
            
            // Educational Note: Show analysis section
            this.showAnalysisProgress();
            
            // Educational Note: Prepare form data for API
            const formData = new FormData();
            formData.append('image', this.currentFile);
            
            // Educational Note: Add address context if available
            const currentAddress = localStorage.getItem('currentAddressId');
            if (currentAddress) {
                formData.append('address_id', currentAddress);
            }
            
            // Educational Note: Make API call
            const response = await this.callAnalysisAPI(formData);
            
            // Educational Note: Process successful response
            if (response.success) {
                console.log('✅ Analysis successful:', response.data);
                this.currentAnalysis = response.data;
                this.showAnalysisResults(response.data);
                this.updatePointsDisplay(response.data.analysis.points_earned);
            } else {
                throw new Error(response.message || 'Analysis failed');
            }
            
        } catch (error) {
            console.error('❌ Analysis failed:', error);
            this.showAnalysisError(error.message);
        } finally {
            // Educational Note: Reset analyzing state
            this.isAnalyzing = false;
            this.hideAnalysisProgress();
        }
    }
    
    /**
     * Educational Method: API Communication
     * Handles communication with backend analysis endpoint
     */
    async callAnalysisAPI(formData) {
        console.log('📡 Calling AI analysis API');
        
        // Educational Note: Update progress
        this.updateProgress(20, 'Uploading image...');
        
        try {
            // Educational Note: Call API service
            if (typeof ApiService !== 'undefined') {
                // Use API service if available
                this.updateProgress(40, 'Processing upload...');
                
                const response = await fetch('/api/scan/upload', {
                    method: 'POST',
                    body: formData
                });
                
                this.updateProgress(70, 'Analyzing with AI...');
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `API error: ${response.status}`);
                }
                
                this.updateProgress(90, 'Finalizing results...');
                
                const data = await response.json();
                this.updateProgress(100, 'Analysis complete!');
                
                return data;
                
            } else {
                // Educational Note: Fallback to direct fetch
                console.warn('⚠️ ApiService not available, using direct fetch');
                return await this.directFetchAPI(formData);
            }
            
        } catch (error) {
            console.error('❌ API call failed:', error);
            throw error;
        }
    }
    
    /**
     * Educational Method: Direct API Fetch
     * Fallback API communication method
     */
    async directFetchAPI(formData) {
        const response = await fetch('/api/scan/upload', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Network error: ${response.status}`);
        }
        
        return await response.json();
    }
    
    /**
     * Educational Method: Progress Display
     * Updates analysis progress indicators
     */
    showAnalysisProgress() {
        console.log('📊 Showing analysis progress');
        
        if (this.config.analysisSection) {
            this.config.analysisSection.style.display = 'block';
        }
        
        this.updateProgress(0, 'Preparing analysis...');
    }
    
    /**
     * Educational Method: Hide Progress
     * Hides progress indicators after completion
     */
    hideAnalysisProgress() {
        if (this.config.analysisSection) {
            this.config.analysisSection.style.display = 'none';
        }
    }
    
    /**
     * Educational Method: Update Progress
     * Updates progress bar and text
     */
    updateProgress(percent, text) {
        if (this.config.progressFill) {
            this.config.progressFill.style.width = `${percent}%`;
        }
        
        if (this.config.progressText) {
            this.config.progressText.textContent = text;
        }
    }
    
    /**
     * Educational Method: Show Analysis Results
     * Displays comprehensive AI analysis results
     */
    showAnalysisResults(data) {
        console.log('📋 Displaying analysis results');
        
        if (!this.config.analysisResult) {
            console.error('❌ Analysis result container not found');
            return;
        }
        
        // Educational Note: Create results HTML
        const resultsHTML = this.createResultsHTML(data);
        
        // Educational Note: Update DOM
        this.config.analysisResult.innerHTML = resultsHTML;
        this.config.analysisResult.style.display = 'block';
        
        // Educational Note: Setup result interactions
        this.setupResultInteractions();
        
        console.log('✅ Results displayed successfully');
    }
    
    /**
     * Educational Method: Create Results HTML
     * Generates comprehensive results display
     */
    createResultsHTML(data) {
        const analysis = data.analysis;
        const educational = data.educational;
        
        return `
            <!-- Educational Results Display -->
            <div class="result-header">
                <div class="result-icon">
                    <i class="fas fa-${this.getIconForMaterial(analysis.material_type)}"></i>
                </div>
                <div class="result-summary">
                    <div class="material-type">${analysis.material_type.toUpperCase()}${analysis.ric_code ? ` (RIC ${analysis.ric_code})` : ''}</div>
                    <div class="confidence-score">
                        Confidence: ${analysis.confidence}%
                        <div class="confidence-bar">
                            <div class="confidence-fill" style="width: ${analysis.confidence}%"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Points Display -->
            <div class="points-earned">
                🏆 You earned ${analysis.points_earned} points!
                <br><small>${analysis.recyclable ? 'Material is recyclable' : 'Material has limited recycling'}</small>
            </div>
            
            <!-- Description -->
            <div style="margin: 1.5rem 0;">
                <h4 style="color: #2d7a2d; margin-bottom: 0.5rem;">
                    <i class="fas fa-info-circle"></i> Analysis Description
                </h4>
                <p style="color: #666; line-height: 1.6;">${analysis.description}</p>
            </div>
            
            <!-- Educational Content -->
            ${educational ? this.createEducationalHTML(educational) : ''}
            
            <!-- Confidence Analysis -->
            ${analysis.confidence_analysis ? this.createConfidenceHTML(analysis.confidence_analysis) : ''}
            
            <!-- Feedback Section -->
            <div class="feedback-section">
                <h4 style="color: #2d7a2d; margin-bottom: 1rem;">
                    <i class="fas fa-star"></i> Was this analysis correct?
                </h4>
                <div class="feedback-buttons">
                    <button class="btn-feedback correct" onclick="submitFeedback('${data.session_id}', true)">
                        <i class="fas fa-thumbs-up"></i> Yes, correct!
                    </button>
                    <button class="btn-feedback incorrect" onclick="submitFeedback('${data.session_id}', false)">
                        <i class="fas fa-thumbs-down"></i> No, incorrect
                    </button>
                </div>
            </div>
            
            <!-- Scan Again Section -->
            <div class="scan-again-section">
                <button class="btn-scan-again" onclick="scanAgain()">
                    <i class="fas fa-camera"></i>
                    Scan Another Item
                </button>
            </div>
        `;
    }
    
    /**
     * Educational Method: Create Educational Content HTML
     * Generates educational information display
     */
    createEducationalHTML(educational) {
        if (!educational) return '';
        
        return `
            <div class="educational-content">
                <h4 style="color: #2d7a2d; margin-bottom: 1rem;">
                    <i class="fas fa-graduation-cap"></i> Educational Information
                </h4>
                
                ${educational.general_info ? `
                    <div class="educational-card">
                        <div class="educational-title">
                            <i class="fas fa-info"></i>
                            Material Information
                        </div>
                        <p><strong>Description:</strong> ${educational.general_info.description}</p>
                        <p><strong>Common Uses:</strong> ${educational.general_info.common_uses?.join(', ')}</p>
                        <p><strong>Decomposition Time:</strong> ${educational.general_info.decomposition_time}</p>
                    </div>
                ` : ''}
                
                ${educational.recycling_tips ? `
                    <div class="educational-card">
                        <div class="educational-title">
                            <i class="fas fa-recycle"></i>
                            Recycling Tips
                        </div>
                        <ul>
                            ${educational.recycling_tips.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${educational.environmental_impact ? `
                    <div class="educational-card">
                        <div class="educational-title">
                            <i class="fas fa-leaf"></i>
                            Environmental Impact
                        </div>
                        <p><strong>Recycling Benefit:</strong> ${educational.environmental_impact.recycling_benefit}</p>
                        <p><strong>Energy Savings:</strong> ${educational.environmental_impact.energy_savings}</p>
                        <p><strong>CO2 Reduction:</strong> ${educational.environmental_impact.co2_reduction}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    /**
     * Educational Method: Create Confidence Analysis HTML
     */
    createConfidenceHTML(confidence) {
        return `
            <div class="educational-card">
                <div class="educational-title">
                    <i class="fas fa-chart-line"></i>
                    Confidence Analysis
                </div>
                <p><strong>Level:</strong> ${confidence.level.charAt(0).toUpperCase() + confidence.level.slice(1)}</p>
                <p><strong>Description:</strong> ${confidence.description}</p>
                <p><strong>Educational Note:</strong> ${confidence.educational_note}</p>
            </div>
        `;
    }
    
    /**
     * Educational Method: Get Icon for Material
     * Returns appropriate icon class for material type
     */
    getIconForMaterial(materialType) {
        const iconMap = {
            plastic: 'wine-bottle',
            cardboard: 'box',
            paper: 'file-alt',
            glass: 'glass-martini',
            metal: 'tools',
            aluminum: 'tools'
        };
        
        return iconMap[materialType] || 'question';
    }
    
    /**
     * Educational Method: Setup Result Interactions
     * Adds interactive functionality to results
     */
    setupResultInteractions() {
        // Educational Note: Global functions for feedback
        window.submitFeedback = (sessionId, isCorrect) => {
            this.submitFeedback(sessionId, isCorrect);
        };
        
        window.scanAgain = () => {
            this.removeImage();
        };
    }
    
    /**
     * Educational Method: Submit User Feedback
     * Sends feedback to improve AI accuracy
     */
    async submitFeedback(sessionId, isCorrect) {
        console.log(`📝 Submitting feedback: ${isCorrect ? 'correct' : 'incorrect'}`);
        
        try {
            const response = await fetch(`/api/scan/${sessionId}/feedback`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    correct: isCorrect
                })
            });
            
            if (response.ok) {
                console.log('✅ Feedback submitted successfully');
                this.showFeedbackConfirmation(isCorrect);
            } else {
                console.error('❌ Feedback submission failed');
            }
            
        } catch (error) {
            console.error('❌ Error submitting feedback:', error);
        }
    }
    
    /**
     * Educational Method: Show Feedback Confirmation
     */
    showFeedbackConfirmation(isCorrect) {
        const message = isCorrect 
            ? 'Thank you! Your feedback helps improve our AI accuracy.' 
            : 'Thank you! We\'ll use your feedback to improve future analysis.';
            
        // Educational Note: Simple confirmation (could be enhanced with toast notifications)
        alert(message);
    }
    
    /**
     * Educational Method: Update Points Display
     * Updates the current points display in the header
     */
    updatePointsDisplay(pointsEarned) {
        try {
            const currentPointsElement = document.getElementById('current-points-display');
            if (currentPointsElement) {
                const currentPoints = parseInt(currentPointsElement.textContent) || 0;
                const newPoints = currentPoints + pointsEarned;
                
                currentPointsElement.textContent = newPoints;
                localStorage.setItem('currentPoints', newPoints.toString());
                
                console.log(`📊 Updated points: +${pointsEarned} (Total: ${newPoints})`);
            }
        } catch (error) {
            console.error('❌ Error updating points display:', error);
        }
    }
    
    /**
     * Educational Method: Show Analysis Error
     * Displays user-friendly error messages
     */
    showAnalysisError(message) {
        console.error('❌ Analysis error:', message);
        
        // Educational Note: Show user-friendly error
        const errorHTML = `
            <div style="text-align: center; padding: 2rem; color: #c62828;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3>Analysis Failed</h3>
                <p style="margin: 1rem 0;">${message}</p>
                <button class="btn-scan-again" onclick="scanAgain()" style="margin-top: 1rem;">
                    <i class="fas fa-redo"></i>
                    Try Again
                </button>
            </div>
        `;
        
        if (this.config.analysisResult) {
            this.config.analysisResult.innerHTML = errorHTML;
            this.config.analysisResult.style.display = 'block';
        }
        
        this.setupResultInteractions();
    }
    
    /**
     * Educational Method: Error Display Management
     */
    showError(message) {
        if (this.config.errorMessage) {
            this.config.errorMessage.textContent = message;
            this.config.errorMessage.style.display = 'block';
        }
        console.error('❌ Error:', message);
    }
    
    hideError() {
        if (this.config.errorMessage) {
            this.config.errorMessage.style.display = 'none';
            this.config.errorMessage.textContent = '';
        }
    }
}

// Educational Note: Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UploadComponent;
}