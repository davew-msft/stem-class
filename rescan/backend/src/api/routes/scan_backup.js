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
 * Learn about: input validation, security filtering MIME type checking
 */
const fileFilter = (req, file, cb) => {
  console.log(`🔍 Validating uploaded file: ${file.originalname} (${file.mimetype})`);
  
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
    console.log('✅ File validation passed:', file.originalname);
    cb(null, true);
  } else {
    console.log('❌ File validation failed:', file.originalname, file.mimetype);
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
 * Educational Error Handler: Multer Errors (Alternative implementation)
 * Learn about: error handling, user feedback, middleware error patterns
 */
function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    console.error('❌ Multer error occurred:', err.code, err.message);
    
    let userMessage = 'File upload failed. ';
    let statusCode = 400;
    
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        userMessage += 'File is too large. Please choose an image smaller than 10MB.';
        break;
      case 'LIMIT_FILE_COUNT':
        userMessage += 'Too many files. Please upload only one image at a time.';
        break;
      case 'LIMIT_FIELD_COUNT':
        userMessage += 'Too many form fields. Please use the standard upload form.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        userMessage += 'Unexpected file field. Please use the "image" field for uploads.';
        break;
      default:
        userMessage += 'Please check your file and try again.';
    }
    
    return res.status(statusCode).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: userMessage,
        details: `Upload error: ${err.code}`
      },
      educational_note: 'File upload middleware validates size, type, and count to ensure system security and performance'
    });
  }
  
  // Educational Note: Handle custom file filter errors
  if (err.message.includes('Invalid file type')) {
    console.error('❌ File type validation error:', err.message);
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: err.message,
        details: 'Only JPG, PNG, and WebP images are supported for AI analysis'
      },
      educational_note: 'Image type validation ensures the AI service can properly analyze the uploaded content'
    });
  }
  
  // Educational Note: Pass through other errors
  next(err);
}

/**
 * POST /api/scan/upload
 * 
 * Upload and analyze an image for recycling symbols using Azure OpenAI
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
    // Validate file upload
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
    logger.info(`Processing upload - File: ${req.file.originalname}, Size: ${req.file.size} bytes, Type: ${req.file.mimetype}`);

    // Get address ID from request (if provided)
    const addressId = req.body.address_id;
    
    // Validate address exists if provided
    if (addressId) {
      try {
        const AddressRepository = require('../../models/address').AddressRepository;
        const addressRepository = new AddressRepository();
        const address = await addressRepository.findById(addressId);
        if (!address) {
          return res.status(404).json({
            error: 'ADDRESS_NOT_FOUND',
            message: 'The specified address was not found',
            educational: {
              concept: 'Foreign Key Validation',
              explanation: 'When linking records, always verify the referenced record exists',
              tip: 'Validate foreign key relationships before creating dependent records'
            }
          });
        }
      } catch (error) {
        logger.error('Error validating address:', error);
        return res.status(500).json({
          error: 'ADDRESS_VALIDATION_FAILED',
          message: 'Failed to validate address',
          educational: {
            concept: 'Error Handling in Validations',
            explanation: 'Even validation steps can fail and need proper error handling'
          }
        });
      }
    }

    // Initialize AI service if not already done
    await aiService.initialize();

    // Perform AI analysis on uploaded image
    logger.info('Starting AI analysis of uploaded image...');
    const analysisResult = await aiService.analyzeRecyclingImage(req.file.path, req.file.originalname);

    // Check if AI analysis was successful
    if (!analysisResult.success) {
      return res.status(422).json({
        error: 'AI_ANALYSIS_FAILED',
        message: analysisResult.message || 'Could not analyze the uploaded image',
        details: analysisResult.error,
        educational: {
          concept: 'AI Service Error Handling',
          explanation: 'AI services can fail due to unclear images, service issues, or unsupported content',
          troubleshooting: analysisResult.educational?.troubleshooting || [
            'Ensure image shows recycling symbols clearly',
            'Check lighting and image quality',
            'Try a different angle or closer shot'
          ]
        }
      });
    }

    // Create scan session with AI analysis results
    const session = new ScanSession({
      addressId: addressId || null,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      fileMimeType: req.file.mimetype,
      materialType: analysisResult.material_type,
      ricCode: analysisResult.ric_code,
      confidence: analysisResult.confidence,
      aiAnalysis: analysisResult.ai_analysis,
      pointsEarned: analysisResult.points,
      isRecyclable: analysisResult.recyclable,
      description: analysisResult.description
    });

    // Save scan session to database
    const sessionRepository = new ScanSession.ScanSessionRepository();
    const savedSession = await sessionRepository.create(session);

    // Update address points if linked to an address
    if (addressId && analysisResult.points > 0) {
      try {
        const AddressRepository = require('../../models/address').AddressRepository;
        const addressRepo = new AddressRepository();
        await addressRepo.addPoints(addressId, analysisResult.points);
        logger.info(`Added ${analysisResult.points} points to address ${addressId}`);
      } catch (error) {
        logger.error('Failed to update address points:', error);
        // Continue with response even if points update fails
      }
    }

    logger.info(`Scan analysis completed successfully - Session ID: ${savedSession.id}, Points: ${analysisResult.points}`);

    // Return comprehensive response with analysis and educational content
    res.status(201).json({
      success: true,
      message: 'Image analyzed successfully!',
      data: {
        session_id: savedSession.id,
        analysis: {
          material_type: analysisResult.material_type,
          ric_code: analysisResult.ric_code,
          description: analysisResult.description,
          confidence: analysisResult.confidence,
          confidence_analysis: analysisResult.confidence_analysis,
          recyclable: analysisResult.recyclable,
          points_earned: analysisResult.points
        },
        educational: analysisResult.educational,
        file_info: {
          original_name: req.file.originalname,
          size_bytes: req.file.size,
          mime_type: req.file.mimetype,
          upload_time: savedSession.createdAt
        }
      },
      educational: {
        concept: 'Complete AI Analysis Workflow',
        explanation: 'This demonstrates the full cycle: file upload → AI analysis → data storage → points calculation',
        learning_outcomes: [
          'File handling and validation',
          'AI service integration',
          'Database transactions',
          'Error handling strategies',
          'Educational feedback systems'
        ]
      }
    });

  } catch (error) {
    logger.error('Error in upload endpoint:', error);
    
    // Clean up uploaded file if processing failed
    if (uploadedFilePath) {
      try {
        await fs.unlink(uploadedFilePath);
        logger.info('Cleaned up uploaded file after error');
      } catch (cleanupError) {
        logger.error('Failed to clean up uploaded file:', cleanupError);
      }
    }

    res.status(500).json({
      error: 'UPLOAD_PROCESSING_FAILED',
      message: 'Failed to process uploaded image',
      educational: {
        concept: 'Error Handling in Complex Workflows',
        explanation: 'When multi-step operations fail, proper cleanup and error reporting are essential',
        tip: 'Always clean up resources (like uploaded files) when operations fail'
      }
    });
  }
});

/**
 * Educational Endpoint: Get Scan History
 * 
 * GET /api/scan/history 
 * Retrieves scan history for an address
 * 
 * Learn about: data retrieval, educational progress tracking
 */
router.get('/history', async (req, res) => {
  try {
    const { address_id, limit = 20, offset = 0 } = req.query;
    
    logger.info(`Scan history request - Address ID: ${address_id}, Limit: ${limit}`);
    
    // Validate parameters
    const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    const offsetNum = Math.max(parseInt(offset) || 0, 0);
    
    const sessionRepository = new ScanSession.ScanSessionRepository();
    
    // Get scan sessions with or without address filter
    let sessions;
    if (address_id) {
      // Validate address exists
      const AddressRepository = require('../../models/address').AddressRepository;
      const addressRepo = new AddressRepository();
      const address = await addressRepo.findById(address_id);
      if (!address) {
        return res.status(404).json({
          error: 'ADDRESS_NOT_FOUND',
          message: 'Address not found',
          educational: {
            concept: 'Entity Validation',
            explanation: 'Verify referenced entities exist before querying dependent data'
          }
        });
      }
      
      sessions = await sessionRepository.findByAddressId(address_id, limitNum, offsetNum);
    } else {
      sessions = await sessionRepository.findAll(limitNum, offsetNum);
    }
    
    // Format response data
    const historyData = sessions.map(session => ({
      id: session.id,
      address_id: session.addressId,
      file_name: session.fileName,
      material_type: session.materialType,
      ric_code: session.ricCode,
      confidence: session.confidence,
      points_earned: session.pointsEarned,
      recyclable: session.isRecyclable,
      description: session.description,
      created_at: session.createdAt,
      user_feedback: session.userFeedback
    }));
    
    logger.info(`Retrieved ${historyData.length} scan history records`);
    
    res.json({
      success: true,
      data: {
        scans: historyData,
        pagination: {
          limit: limitNum,
          offset: offsetNum,
          count: historyData.length,
          has_more: historyData.length === limitNum
        },
        statistics: {
          total_scans: historyData.length,
          total_points: historyData.reduce((sum, scan) => sum + scan.points_earned, 0),
          recyclable_count: historyData.filter(scan => scan.recyclable).length,
          average_confidence: historyData.length > 0 
            ? Math.round(historyData.reduce((sum, scan) => sum + scan.confidence, 0) / historyData.length)
            : 0
        }
      },
      educational: {
        concept: 'Data Retrieval with Analytics',
        explanation: 'Scan history provides progress tracking and learning analytics',
        benefits: [
          'Track learning progress over time',
          'Identify improvement patterns',
          'Review past identifications',
          'Monitor confidence trends'
        ]
      }
    });
    
  } catch (error) {
    logger.error('Error retrieving scan history:', error);
    res.status(500).json({
      error: 'HISTORY_RETRIEVAL_FAILED',
      message: 'Failed to retrieve scan history',
      educational: {
        concept: 'Error Handling in Data Retrieval',
        explanation: 'Database queries can fail and need proper error handling'
      }
    });
  }
});

/**
 * Educational Endpoint: Update Scan Feedback
 * 
 * PATCH /api/scan/feedback
 * Allows users to provide feedback on AI accuracy
 * 
 * Learn about: user feedback loops, data quality improvement
 */
router.patch('/:id/feedback', async (req, res) => {
  try {
    const { id } = req.params;
    const { correct, feedback_text, actual_material_type, actual_ric_code } = req.body;
    
    logger.info(`Feedback submission for scan ${id}`);
    
    // Validate scan ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        error: 'INVALID_SCAN_ID',
        message: 'Invalid scan ID format',
        educational: {
          concept: 'UUID Validation',
          explanation: 'UUIDs have a specific format that should be validated'
        }
      });
    }
    
    // Find existing scan session
    const sessionRepository = new ScanSession.ScanSessionRepository();
    const session = await sessionRepository.findById(id);
    
    if (!session) {
      return res.status(404).json({
        error: 'SCAN_NOT_FOUND',
        message: 'Scan session not found',
        educational: {
          concept: 'Entity Existence Validation',
          explanation: 'Always verify entities exist before attempting to update them'
        }
      });
    }
    
    // Validate feedback data
    if (typeof correct !== 'boolean') {
      return res.status(400).json({
        error: 'INVALID_FEEDBACK',
        message: 'Correct field must be true or false',
        educational: {
          concept: 'Data Type Validation',
          explanation: 'Boolean fields require strict type validation'
        }
      });
    }
    
    // Prepare feedback data
    const feedbackData = {
      correct,
      feedback_text: feedback_text ? feedback_text.trim() : null,
      actual_material_type: actual_material_type ? actual_material_type.trim() : null,
      actual_ric_code: actual_ric_code ? parseInt(actual_ric_code) : null,
      submitted_at: new Date().toISOString()
    };
    
    // Update session with feedback
    session.userFeedback = feedbackData;
    const updatedSession = await sessionRepository.update(session);
    
    logger.info(`Feedback recorded for scan ${id}: ${correct ? 'correct' : 'incorrect'}`);
    
    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        scan_id: id,
        feedback_received: feedbackData,
        original_analysis: {
          material_type: session.materialType,
          ric_code: session.ricCode,
          confidence: session.confidence
        }
      },
      educational: {
        concept: 'User Feedback Integration',
        explanation: 'User feedback helps improve AI model accuracy and provides learning insights',
        impact: [
          'Helps identify AI model weaknesses',
          'Improves future recognition accuracy',
          'Provides real learning data',
          'Enhances educational value'
        ]
      }
    });
    
  } catch (error) {
    logger.error('Error submitting feedback:', error);
    res.status(500).json({
      error: 'FEEDBACK_SUBMISSION_FAILED',
      message: 'Failed to submit feedback',
      educational: {
        concept: 'Error Handling in Updates',
        explanation: 'Update operations can fail and need proper error handling and rollback'
      }
    });
  }
});

// Educational Note: Export router for use in main application
module.exports = router;