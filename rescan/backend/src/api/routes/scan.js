/**
 * Educational Routes: Scan and AI Analysis
 * 
 * Handles image uploads, AI processing, and scan session management  
 * Learn about: file uploads, AI integration, multipart forms, image processing
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();
const logger = require('../../utils/logger');

// Import ScanSession model and AI service
const ScanSession = require('../../models/scanSession');
const aiService = require('../../services/aiService');

/**
 * Educational Configuration: Multer Storage Setup
 * 
 * Configures file upload handling with educational comments
 * Learn about: file storage, naming strategies, path management
 */
const storage = multer.diskStorage({
  // Educational Note: Define where uploaded files are stored
  destination: async function (req, file, cb) {
    try {
      // Educational Note: Create uploads directory if it doesn't exist
      const uploadDir = path.join(__dirname, '../../../data/uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      
      logger.info('Upload directory prepared:', uploadDir);
      cb(null, uploadDir);
    } catch (error) {
      logger.error('Upload directory creation failed:', error.message);
      cb(error);
    }
  },
  
  // Educational Note: Generate unique filename to prevent conflicts
  filename: function (req, file, cb) {
    // Educational Note: Create timestamp-based filename with original extension
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname).toLowerCase();
    
    const filename = `scan_${timestamp}_${randomSuffix}${extension}`;
    logger.info(`Generated filename: ${filename} for original: ${file.originalname}`);
    
    cb(null, filename);
  }
});

/**
 * Educational Configuration: File Filter for Security
 * 
 * Validates file types for educational security practices
 * Learn about: input validation, security filtering, MIME type checking
 */
const fileFilter = (req, file, cb) => {
  logger.info(`Validating uploaded file: ${file.originalname} (${file.mimetype})`);
  
  // Educational Note: Define acceptable image MIME types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ];
  
  // Educational Note: Check file extension as additional validation
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    logger.info(`File validation passed: ${file.originalname}`);
    cb(null, true);
  } else {
    logger.warn(`File validation failed: ${file.originalname} - ${file.mimetype}`);
    cb(new Error(`Invalid file type. Please upload JPG, PNG, or WebP images only. Received: ${file.mimetype}`), false);
  }
};

/**
 * Educational Configuration: Multer Upload Configuration
 * 
 * Complete upload configuration with limits and validation
 * Learn about: middleware configuration, resource limits, security practices
 */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB educational limit for high-quality images
    files: 1, // Single file uploads only
    fields: 10, // Limit form fields
  }
});

/**
 * Educational Error Handler: Multer Errors
 * 
 * Provides educational error messages for upload failures
 * Learn about: error handling, user feedback, middleware error patterns
 */
function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    logger.error('Multer error occurred:', err.code, err.message);
    
    let message = 'File upload failed. ';
    let statusCode = 400;
    
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message += 'File is too large. Please choose an image smaller than 10MB.';
        break;
      case 'LIMIT_FILE_COUNT':
        message += 'Too many files. Please upload only one image.';
        break;
      case 'LIMIT_FIELD_COUNT':
        message += 'Too many form fields. Please use the standard form.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message += 'Unexpected file field. Please use the "image" field.';
        break;
      default:
        message += 'Please check your file and try again.';
    }
    
    return res.status(statusCode).json({
      error: 'UPLOAD_ERROR',
      message: message,
      details: err.code,
      educational: {
        concept: 'File Upload Validation',
        explanation: 'Upload middleware validates files to ensure system security and performance'
      }
    });
  }
  
  if (err.message.includes('Invalid file type')) {
    logger.error('File type validation error:', err.message);
    return res.status(400).json({
      error: 'INVALID_FILE_TYPE',
      message: err.message,
      educational: {
        concept: 'File Type Validation',
        explanation: 'Only image files are accepted for AI analysis to ensure proper processing'
      }
    });
  }
  
  next(err);
}

/**
 * POST /api/scan/upload
 * 
 * Upload and analyze an image for recycling symbols using AI
 * 
 * Educational Learning Objectives:
 * - File upload handling and validation
 * - AI service integration patterns
 * - Database transaction patterns
 * - Error handling in complex workflows
 * - Points calculation and validation
 */
router.post('/upload', upload.single('image'), handleMulterError, async (req, res) => {
  let uploadedFilePath = null;
  
  try {
    // Educational Note: Validate file upload
    if (!req.file) {
      return res.status(400).json({
        error: 'FILE_REQUIRED',
        message: 'Please select an image file to upload',
        educational: {
          concept: 'File Upload Validation',
          explanation: 'Server-side validation ensures required files are present before processing',
          tip: 'Always validate file uploads on both client and server sides'
        }
      });
    }

    uploadedFilePath = req.file.path;
    logger.info(`Processing upload - File: ${req.file.originalname}, Size: ${req.file.size} bytes`);

    // Educational Note: Get address ID from request (optional)
    const addressId = req.body.address_id || null;
    
    // Educational Note: Create initial scan session record
    const scanData = {
      address_id: addressId,
      image_path: uploadedFilePath,
      original_filename: req.file.originalname,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      status: 'processing'
    };
    
    logger.info('Creating scan session:', scanData);
    const scanSession = await ScanSession.create(scanData);
    
    // Educational Note: Process image with AI service
    logger.info(`Starting AI analysis for scan ID: ${scanSession.id}`);
    
    try {
      const aiResult = await aiService.analyzeImage(uploadedFilePath, {
        filename: req.file.originalname,
        scanId: scanSession.id
      });
      
      logger.info('AI analysis completed:', aiResult);
      
      // Educational Note: Update scan session with results
      await ScanSession.update(scanSession.id, {
        status: 'completed',
        ai_analysis: JSON.stringify(aiResult.analysis),
        recycling_symbols: JSON.stringify(aiResult.symbols || []),
        confidence_score: aiResult.confidence,
        points_earned: aiResult.points || 0,
        processed_at: new Date().toISOString()
      });
      
      // Educational Note: Return success response with educational data
      res.json({
        success: true,
        message: 'Image analyzed successfully! Great job learning about recycling!',
        data: {
          scan_id: scanSession.id,
          filename: req.file.originalname,
          analysis: aiResult.analysis,
          symbols: aiResult.symbols || [],
          confidence: aiResult.confidence,
          points_earned: aiResult.points || 0,
          educational_feedback: aiResult.educational_feedback
        },
        educational: {
          concept: 'AI Image Analysis for Environmental Education',
          learning_objectives: [
            'Identify recycling symbols and materials',
            'Understand environmental impact of recycling',
            'Learn about proper waste sorting practices',
            'Develop AI literacy through practical application'
          ],
          next_steps: [
            'Try uploading different types of recyclable materials',
            'Compare recycling symbols from different products',
            'Learn about your local recycling guidelines'
          ]
        }
      });
      
    } catch (aiError) {
      logger.error('AI analysis failed:', aiError.message);
      
      // Educational Note: Update scan session with error state
      await ScanSession.update(scanSession.id, {
        status: 'failed',
        error_message: aiError.message,
        processed_at: new Date().toISOString()
      });
      
      // Educational Note: Return educational fallback response
      res.json({
        success: true,
        message: 'AI analysis temporarily unavailable, but here is educational feedback!',
        data: {
          scan_id: scanSession.id,
          filename: req.file.originalname,
          analysis: 'AI service currently unavailable for detailed analysis',
          symbols: [],
          confidence: 0,
          points_earned: 5, // Educational participation points
          educational_feedback: {
            message: 'Great job participating in environmental learning!',
            tips: [
              'Look for recycling symbols on product packaging',
              'Learn about the different types of recyclable materials',
              'Check your local recycling guidelines for proper sorting',
              'Remember that not all plastics are recyclable'
            ],
            encouragement: 'Keep exploring and learning about environmental responsibility!'
          }
        },
        educational: {
          concept: 'Environmental Education Through Technology',
          explanation: 'Even without AI analysis, you are learning valuable skills about environmental awareness',
          learning_value: 'The practice of identifying and sorting recyclable materials is valuable for environmental stewardship'
        }
      });
    }
    
  } catch (error) {
    logger.error('Upload processing error:', error.message);
    
    // Educational Note: Clean up uploaded file on error
    if (uploadedFilePath) {
      try {
        await fs.unlink(uploadedFilePath);
        logger.info('Cleaned up uploaded file after error');
      } catch (cleanupError) {
        logger.error('Failed to clean up file:', cleanupError.message);
      }
    }
    
    res.status(500).json({
      error: 'PROCESSING_ERROR',
      message: 'Failed to process image upload. Please try again.',
      educational: {
        concept: 'Error Handling and Recovery',
        explanation: 'Proper error handling ensures good user experience even when things go wrong',
        tip: 'Always clean up resources and provide helpful error messages'
      }
    });
  }
});

/**
 * GET /api/scan/history
 * 
 * Get scan history for educational review
 * 
 * Educational Learning Objectives:
 * - Data retrieval patterns
 * - User progress tracking
 * - Educational progress visualization
 */
router.get('/history', async (req, res) => {
  try {
    // Educational Note: Get optional address filter
    const addressId = req.query.address_id;
    
    // Educational Note: Retrieve scan history with educational formatting
    const scans = await ScanSession.getHistory(addressId);
    
    logger.info(`Retrieved ${scans.length} scan records for educational review`);
    
    // Educational Note: Calculate educational statistics
    const stats = {
      total_scans: scans.length,
      successful_scans: scans.filter(scan => scan.status === 'completed').length,
      total_points: scans.reduce((sum, scan) => sum + (scan.points_earned || 0), 0),
      materials_identified: scans.reduce((count, scan) => {
        const symbols = scan.recycling_symbols ? JSON.parse(scan.recycling_symbols) : [];
        return count + symbols.length;
      }, 0)
    };
    
    res.json({
      success: true,
      message: 'Scan history retrieved for educational review',
      data: {
        history: scans,
        statistics: stats
      },
      educational: {
        concept: 'Learning Progress Tracking',
        explanation: 'Tracking your scanning history helps measure learning progress and environmental awareness growth',
        achievements: {
          scans_completed: stats.successful_scans,
          points_earned: stats.total_points,
          materials_learned: stats.materials_identified
        }
      }
    });
    
  } catch (error) {
    logger.error('History retrieval error:', error.message);
    
    res.status(500).json({
      error: 'HISTORY_ERROR',
      message: 'Failed to retrieve scan history',
      educational: {
        concept: 'Database Query Error Handling',
        explanation: 'Proper error handling ensures the application remains stable during data retrieval issues'
      }
    });
  }
});

/**
 * PATCH /api/scan/:id/feedback
 * 
 * Submit user feedback on scan results for educational improvement
 * 
 * Educational Learning Objectives:
 * - User feedback collection patterns
 * - Educational feedback loops
 * - Continuous improvement processes
 */
router.patch('/:id/feedback', async (req, res) => {
  try {
    const scanId = req.params.id;
    const { user_feedback, rating, learning_value } = req.body;
    
    // Educational Note: Validate feedback data
    if (!user_feedback && !rating && !learning_value) {
      return res.status(400).json({
        error: 'FEEDBACK_REQUIRED',
        message: 'Please provide feedback, rating, or learning value assessment',
        educational: {
          concept: 'Input Validation',
          explanation: 'Feedback forms should validate that users provide meaningful input'
        }
      });
    }
    
    // Educational Note: Update scan session with feedback
    const updateData = {
      user_feedback,
      user_rating: rating,
      learning_value,
      feedback_at: new Date().toISOString()
    };
    
    const updatedScan = await ScanSession.update(scanId, updateData);
    
    if (!updatedScan) {
      return res.status(404).json({
        error: 'SCAN_NOT_FOUND',
        message: 'Scan session not found',
        educational: {
          concept: 'Resource Validation',
          explanation: 'Always verify that resources exist before attempting updates'
        }
      });
    }
    
    logger.info(`Feedback submitted for scan ${scanId}:`, { user_feedback, rating, learning_value });
    
    res.json({
      success: true,
      message: 'Thank you for your feedback! This helps improve the educational experience.',
      data: {
        scan_id: scanId,
        feedback_received: {
          user_feedback,
          rating,
          learning_value
        }
      },
      educational: {
        concept: 'Educational Feedback Loops',
        explanation: 'Student feedback helps improve learning experiences and educational technology',
        thank_you: 'Your input contributes to better environmental education for everyone!'
      }
    });
    
  } catch (error) {
    logger.error('Feedback submission error:', error.message);
    
    res.status(500).json({
      error: 'FEEDBACK_ERROR',
      message: 'Failed to submit feedback. Please try again.',
      educational: {
        concept: 'Error Recovery',
        explanation: 'Applications should gracefully handle errors while encouraging user participation'
      }
    });
  }
});

// Educational Export: Router with scan endpoints
module.exports = router;