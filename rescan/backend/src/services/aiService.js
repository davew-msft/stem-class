/**
 * AI Service for Recycling Symbol Recognition
 * 
 * Educational Focus:
 * - Azure OpenAI integration patterns with Entra ID authentication
 * - Image analysis and machine learning concepts
 * - Error handling in AI systems
 * - Confidence scoring and validation
 * - Educational prompt engineering techniques
 * - Azure AD (Entra ID) Service Principal authentication
 * 
 * This service demonstrates how to integrate AI into educational applications
 * while maintaining proper error handling and educational value.
 * 
 * Authentication: Uses Azure AD (Entra ID) with Service Principal
 * - Requires: AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET
 * - More secure than API keys for production environments
 * - Supports Azure RBAC and Managed Identity patterns
 */

const { OpenAI } = require('openai');
const { ClientSecretCredential } = require('@azure/identity');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this.educationalPrompts = this.getEducationalPrompts();
    this.ricSymbolDatabase = this.getRICSymbolDatabase();
  }

  /**
   * Initialize Azure OpenAI client with Azure AD (Entra ID) authentication
   * 
   * Educational Note: This uses Service Principal authentication which is more secure
   * than API keys and supports Azure role-based access control (RBAC)
   */
  async initialize() {
    try {
      // Educational Note: Check for required Azure AD credentials
      const requiredEnvVars = {
        AZURE_TENANT_ID: process.env.AZURE_TENANT_ID,
        AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID,
        AZURE_CLIENT_SECRET: process.env.AZURE_CLIENT_SECRET,
        AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT,
        AZURE_OPENAI_DEPLOYMENT_NAME: process.env.AZURE_OPENAI_DEPLOYMENT_NAME
      };

      const missingVars = Object.entries(requiredEnvVars)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      if (missingVars.length > 0) {
        logger.warn(`Azure AD credentials not configured - missing: ${missingVars.join(', ')}`);
        logger.warn('Using mock responses for educational demonstration');
        this.isInitialized = false;
        return false;
      }

      // Educational Note: Create Azure AD credential using Service Principal
      // This is more secure than API keys and supports Azure RBAC
      const credential = new ClientSecretCredential(
        process.env.AZURE_TENANT_ID,
        process.env.AZURE_CLIENT_ID,
        process.env.AZURE_CLIENT_SECRET
      );

      logger.info('Azure AD credential created successfully');
      logger.info(`Endpoint: ${process.env.AZURE_OPENAI_ENDPOINT}`);
      logger.info(`Deployment: ${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`);

      // Get Azure AD token
      const tokenResponse = await credential.getToken('https://cognitiveservices.azure.com/.default');
      
      if (!tokenResponse || !tokenResponse.token) {
        throw new Error('Failed to obtain Azure AD token');
      }

      logger.info('Azure AD token obtained successfully');

      // Educational Note: Initialize OpenAI client for Azure with Azure AD authentication
      // The openai SDK supports Azure OpenAI natively
      this.client = new OpenAI({
        apiKey: tokenResponse.token,
        baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
        defaultQuery: { 'api-version': '2024-10-01-preview' },
        defaultHeaders: {
          'Authorization': `Bearer ${tokenResponse.token}`
        }
      });

      // Store credential for potential token refresh
      this.credential = credential;

      // Store deployment name for use in requests
      this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

      // Test the connection with a simple request
      await this.testConnection();
      
      this.isInitialized = true;
      logger.info('Azure OpenAI service initialized successfully with Azure AD authentication');
      logger.info('Educational Note: Using Service Principal authentication (more secure than API keys)');
      return true;

    } catch (error) {
      logger.error('Failed to initialize Azure OpenAI service:', error);
      logger.error('Educational Note: Check Azure AD Service Principal credentials and permissions');
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Test Azure OpenAI connection
   */
  async testConnection() {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    logger.info('Testing connection to Azure OpenAI...');
    logger.info(`Deployment: ${this.deploymentName}`);
    
    // For OpenAI SDK with Azure, don't pass model when deployment is in baseURL
    const response = await this.client.chat.completions.create({
      messages: [{ role: 'user', content: 'Test connection - respond with "OK"' }],
      max_tokens: 10
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error('Invalid response from Azure OpenAI service');
    }

    logger.info('Azure OpenAI connection test successful');
    logger.info(`Response: ${response.choices[0].message.content}`);
  }

  /**
   * Analyze uploaded image for recycling symbols
   * Returns educational analysis with confidence scoring
   */
  async analyzeRecyclingImage(imagePath, originalFileName = 'uploaded_image') {
    let initError = null;
    try {
      // Lazy initialization: attempt to connect to Azure OpenAI on first call
      // Use a 30-second timeout so a bad credential doesn't hang the request
      if (!this.isInitialized && !this._initAttempted) {
        this._initAttempted = true;
        await Promise.race([
          this.initialize(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Azure OpenAI initialization timed out after 30s — check Service Principal credentials')), 30000))
        ]);
      }

      if (!this.isInitialized || !this.client) {
        throw new Error('Azure OpenAI is not initialized. Check your AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_OPENAI_ENDPOINT, and AZURE_OPENAI_DEPLOYMENT_NAME environment variables.');
      }

      logger.info(`Starting AI analysis for image: ${originalFileName}`);

      // Check if file exists
      await fs.access(imagePath);
      
      // Get file stats for logging
      const stats = await fs.stat(imagePath);
      logger.info(`Analyzing image: ${originalFileName}, Size: ${stats.size} bytes`);

      const analysisResult = await this.performRealAIAnalysis(imagePath, originalFileName);

      // Enhance result with educational content
      analysisResult.educational = this.getEducationalContent(analysisResult.material_type, analysisResult.ric_code);
      
      // Add confidence validation
      analysisResult.confidence_analysis = this.analyzeConfidence(analysisResult.confidence);

      logger.info(`AI analysis completed for ${originalFileName}: ${analysisResult.material_type}, Confidence: ${analysisResult.confidence}%`);
      
      return analysisResult;

    } catch (error) {
      logger.error('Error in AI image analysis:', error);
      
      // Return error response with debug info so the frontend can show what went wrong
      return {
        success: false,
        error: 'AI_ANALYSIS_FAILED',
        message: 'Unable to analyze image for recycling symbols',
        educational: {
          error_explanation: 'AI analysis can fail due to unclear images, unsupported file formats, or service unavailability',
          troubleshooting: [
            'Ensure image is clear and well-lit',
            'Check that recycling symbol is visible',
            'Try a different angle or lighting',
            'Verify file format is supported (JPEG, PNG)'
          ],
          learning_moment: 'This demonstrates the importance of error handling in AI applications'
        },
        confidence: 0,
        material_type: 'plastic',
        ric_code: null,
        points: 0,
        debug: {
          raw_prompts: [{ role: 'error', content: `Analysis failed: ${error.message}` }],
          raw_response: `ERROR: ${error.message}\n\nStack: ${error.stack}`
        }
      };
    }
  }

  /**
   * Perform real AI analysis using Azure OpenAI Vision API
   */
  async performRealAIAnalysis(imagePath, fileName) {
    try {
      // Read and encode image
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');
      
      // Create the vision analysis prompt
      const messages = [
        {
          role: 'system',
          content: this.educationalPrompts.system_prompt
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: this.educationalPrompts.analysis_prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: 'high'
              }
            }
          ]
        }
      ];

      // Call Azure OpenAI Vision API
      const response = await this.client.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.3 // Lower temperature for more consistent analysis
      });

      const aiResponse = response.choices[0].message.content;
      logger.info('Raw AI response received:', aiResponse);

      // Build text-only version of prompts (exclude base64 image data)
      const rawPrompts = messages.map(m => {
        if (Array.isArray(m.content)) {
          const textParts = m.content.filter(p => p.type === 'text').map(p => p.text);
          return { role: m.role, content: textParts.join('\n') + '\n[image attached]' };
        }
        return { role: m.role, content: m.content };
      });

      // Parse AI response into structured format
      const result = this.parseAIResponse(aiResponse, fileName);
      result.debug = { raw_prompts: rawPrompts, raw_response: aiResponse };
      return result;

    } catch (error) {
      logger.error('Azure OpenAI analysis failed:', error);
      throw error;
    }
  }

  /**
   * Parse AI response into structured analysis result
   */
  parseAIResponse(aiResponse, fileName) {
    try {
      // Strip markdown code fences if present (e.g. ```json ... ```)
      let cleanResponse = aiResponse.trim();
      const fenceMatch = cleanResponse.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/);
      if (fenceMatch) {
        cleanResponse = fenceMatch[1].trim();
      }

      // Try to parse JSON response
      let parsed;
      try {
        parsed = JSON.parse(cleanResponse);
      } catch (jsonError) {
        // If not JSON, extract using regex patterns
        parsed = this.extractFromTextResponse(cleanResponse);
      }

      // Validate and normalize response
      const ricCode = this.normalizeRICCode(parsed.ric_code || parsed.ric);
      const result = {
        success: true,
        material_type: this.normalizeMaterialType(parsed.material_type || parsed.material, ricCode),
        ric_code: ricCode,
        confidence: Math.min(Math.max(parseInt(parsed.confidence) || 50, 0), 100),
        description: parsed.description || 'AI-identified recycling symbol',
        reasoning: parsed.reasoning || null,
        recyclable: parsed.recyclable !== false, // Default to true unless explicitly false
        points: this.calculatePoints(parsed.material_type, parsed.ric_code, parsed.confidence),
        ai_analysis: {
          raw_response: aiResponse,
          processing_method: 'azure_openai_vision',
          timestamp: new Date().toISOString(),
          model_used: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o'
        }
      };

      // Validate result
      if (!result.material_type || result.confidence < 20) {
        result.success = false;
        result.error = 'LOW_CONFIDENCE_ANALYSIS';
        result.message = 'AI analysis produced low confidence results';
      }

      return result;

    } catch (error) {
      logger.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI analysis results');
    }
  }

  /**
   * Extract information from text-based AI response using patterns
   */
  extractFromTextResponse(text) {
    const result = {};

    // Extract material type
    const materialMatch = text.match(/(?:material|type):\s*([^,\n]+)/i);
    result.material_type = materialMatch ? materialMatch[1].trim() : 'plastic';

    // Extract RIC code
    const ricMatch = text.match(/(?:ric|code|number):\s*(\d+)/i);
    result.ric_code = ricMatch ? parseInt(ricMatch[1]) : null;

    // Extract confidence
    const confidenceMatch = text.match(/(?:confidence|certainty):\s*(\d+)/i);
    result.confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 50;

    // Extract recyclable status
    const recyclableMatch = text.match(/recyclable:\s*(yes|no|true|false)/i);
    result.recyclable = recyclableMatch ? ['yes', 'true'].includes(recyclableMatch[1].toLowerCase()) : true;

    return result;
  }

  /**
   * Perform mock AI analysis for educational demonstration
   */
  async performMockAIAnalysis(imagePath, fileName) {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Generate realistic mock response based on common plastic scenarios
    const mockScenarios = [
      {
        material_type: 'plastic',
        ric_code: 1,
        description: 'PET (Polyethylene Terephthalate) plastic bottle',
        confidence: 85,
        recyclable: true,
        educational_note: 'PET is one of the most commonly recycled plastics'
      },
      {
        material_type: 'plastic',
        ric_code: 2,
        description: 'HDPE (High-Density Polyethylene) container',
        confidence: 78,
        recyclable: true,
        educational_note: 'HDPE is widely accepted in recycling programs'
      },
      {
        material_type: 'plastic',
        ric_code: 5,
        description: 'PP (Polypropylene) container',
        confidence: 70,
        recyclable: true,
        educational_note: 'PP recycling availability varies by location'
      },
      {
        material_type: 'plastic',
        ric_code: 4,
        description: 'LDPE (Low-Density Polyethylene) bag or wrap',
        confidence: 65,
        recyclable: true,
        educational_note: 'LDPE often requires special drop-off locations'
      }
    ];

    // Select random scenario or base on filename patterns
    const scenario = fileName.toLowerCase().includes('bottle') ? mockScenarios[0] :
                    mockScenarios[Math.floor(Math.random() * mockScenarios.length)];

    const mockPrompts = [
      { role: 'system', content: this.educationalPrompts.system_prompt },
      { role: 'user', content: this.educationalPrompts.analysis_prompt + '\n[image attached]' }
    ];
    const mockResponse = JSON.stringify(scenario, null, 2);

    return {
      success: true,
      ...scenario,
      points: this.calculatePoints(scenario.material_type, scenario.ric_code, scenario.confidence),
      ai_analysis: {
        processing_method: 'mock_analysis_for_education',
        timestamp: new Date().toISOString(),
        note: 'This is a simulated AI response for educational purposes'
      },
      debug: { raw_prompts: mockPrompts, raw_response: mockResponse }
    };
  }

  /**
   * Calculate points based on material type, RIC code, and confidence
   */
  calculatePoints(materialType, ricCode, confidence) {
    // All scanned items are plastic
    let basePoints = 10;

    // RIC code multipliers (some codes are more valuable)
    const ricMultipliers = {
      1: 1.2, // PET - highly recyclable
      2: 1.1, // HDPE - widely accepted
      3: 0.8, // PVC - limited recycling
      4: 0.9, // LDPE - limited acceptance
      5: 1.0, // PP - standard
      6: 0.7, // PS - limited recycling
      7: 0.5  // Other - difficult to recycle
    };

    if (ricCode && ricMultipliers[ricCode]) {
      basePoints *= ricMultipliers[ricCode];
    }

    // Confidence multiplier
    const confidenceMultiplier = Math.max(0.3, confidence / 100);
    
    // Final calculation
    const finalPoints = Math.round(basePoints * confidenceMultiplier);
    
    return Math.max(1, finalPoints); // Minimum 1 point
  }

  /**
   * Normalize material type using RIC database when available
   */
  normalizeMaterialType(type, ricCode) {
    if (ricCode && this.ricSymbolDatabase[ricCode]) {
      const ric = this.ricSymbolDatabase[ricCode];
      return `${ric.name} - ${ric.full_name}`;
    }
    return type || 'plastic';
  }

  /**
   * Normalize RIC code to valid integer
   */
  normalizeRICCode(code) {
    if (!code) return null;
    
    const parsed = parseInt(code);
    return (parsed >= 1 && parsed <= 7) ? parsed : null;
  }

  /**
   * Analyze confidence score and provide educational feedback
   */
  analyzeConfidence(confidence) {
    if (confidence >= 80) {
      return {
        level: 'high',
        description: 'High confidence - AI is very certain about the analysis',
        educational_note: 'High confidence suggests clear, recognizable recycling symbols'
      };
    } else if (confidence >= 60) {
      return {
        level: 'medium',
        description: 'Medium confidence - AI has moderate certainty',
        educational_note: 'Medium confidence may indicate partial symbol visibility or lighting issues'
      };
    } else if (confidence >= 40) {
      return {
        level: 'low',
        description: 'Low confidence - AI results may be uncertain',
        educational_note: 'Low confidence suggests the image may need improvement'
      };
    } else {
      return {
        level: 'very_low',
        description: 'Very low confidence - results highly uncertain',
        educational_note: 'Very low confidence indicates the symbol may not be clearly visible'
      };
    }
  }

  /**
   * Get educational content for specific material types and RIC codes
   */
  getEducationalContent(materialType, ricCode) {
    const content = {
      general_info: this.getMaterialInfo(materialType),
      ric_info: ricCode ? this.getRICInfo(ricCode) : null,
      recycling_tips: this.getRecyclingTips(materialType),
      environmental_impact: this.getEnvironmentalImpact(materialType)
    };

    return content;
  }

  /**
   * Get material-specific information
   */
  getMaterialInfo(materialType) {
    return {
      description: 'Plastic materials made from petroleum-based polymers',
      common_uses: ['Bottles', 'Containers', 'Packaging', 'Bags'],
      decomposition_time: '450-1000 years',
      recycling_process: 'Melting and reforming into new products'
    };
  }

  /**
   * Get RIC code specific information
   */
  getRICInfo(ricCode) {
    return this.ricSymbolDatabase[ricCode] || {
      code: ricCode,
      name: 'Unknown plastic type',
      description: 'RIC code not recognized',
      recyclability: 'Check local guidelines'
    };
  }

  /**
   * Get recycling tips for material type
   */
  getRecyclingTips(materialType) {
    return [
      'Remove caps and lids if required by local facility',
      'Rinse containers to remove food residue',
      'Check local guidelines for accepted plastic types',
      'Avoid putting plastic bags in curbside bins'
    ];
  }

  /**
   * Get environmental impact information
   */
  getEnvironmentalImpact(materialType) {
    return {
      recycling_benefit: 'Saves petroleum, reduces ocean pollution',
      energy_savings: 'Uses 88% less energy than making new plastic',
      co2_reduction: 'Reduces CO2 emissions by 1-2 tons per ton recycled'
    };
  }

  /**
   * Get educational prompts for AI analysis
   */
  getEducationalPrompts() {
    return {
      system_prompt: `You are an expert recycling symbol recognition AI. 
Your job is to analyze images and identify recycling symbols with HIGH accuracy and consistency.

STRICT RULES (VERY IMPORTANT):
1. If a recycling triangle with a number (RIC code 1–7) is visible, you MUST:
- Return that exact number as "ric_code"
- Match it to the correct plastic type using this mapping ONLY:

1 = Polyethylene Terephthalate (PET/PETE)
2 = High-Density Polyethylene (HDPE)
3 = Polyvinyl Chloride (PVC)
4 = Low-Density Polyethylene (LDPE)
5 = Polypropylene (PP)
6 = Polystyrene (PS)
7 = Other (Mixed Plastics)

2. NEVER mismatch the number and material.
- Example: If ric_code = 4, it MUST be LDPE (not polystyrene)
- If unsure, LOWER confidence instead of guessing

3. ONLY infer material type IF NO number is visible.
- If guessing, set ric_code = null
- Lower confidence significantly (below 60)

4. If a recycling symbol is visible but number is unclear:
- material_type = "plastic"
- ric_code = null
- explain uncertainty

5. Confidence Rules:
- 90-100: number clearly visible
- 70-89: mostly clear but slightly obstructed
- 40-69: symbol visible but number unclear
- below 40: very unclear or guessing

6. Recyclability:
- 1, 2 → true
- 4, 5 → true (but may vary)
- 3, 6, 7 → false

7. Be concise but educational.

Response Format: Return a JSON object with these fields:
{
  "material_type": "plastic",
  "ric_code": number or null,
  "confidence": confidence percentage (0-100),
  "description": "What you visually see",
  "recyclable": true/false based on general guidelines,
  "reasoning": "Why you chose this result"
}

`,

      analysis_prompt: `Please analyze this image for recycling symbols and materials.  

Return your analysis in the JSON format specified in your system instructions.`
    };
  }

  /**
   * Get RIC symbol database for educational reference
   */
  getRICSymbolDatabase() {
    return {
      1: {
        code: 1,
        name: 'PET/PETE',
        full_name: 'Polyethylene Terephthalate',
        description: 'Clear plastic bottles, food containers',
        recyclability: 'Highly recyclable, widely accepted',
        common_products: ['Water bottles', 'Soda bottles', 'Food jars'],
        recycling_rate: '29.1% in US (2018)',
        educational_note: 'One of the most commonly recycled plastics'
      },
      2: {
        code: 2,
        name: 'HDPE',
        full_name: 'High-Density Polyethylene',
        description: 'Milk jugs, detergent bottles, shopping bags',
        recyclability: 'Widely recyclable',
        common_products: ['Milk containers', 'Cleaning product bottles', 'Shopping bags'],
        recycling_rate: '29.3% in US (2018)',
        educational_note: 'Very commonly accepted in curbside recycling'
      },
      3: {
        code: 3,
        name: 'PVC',
        full_name: 'Polyvinyl Chloride',
        description: 'Pipes, vinyl siding, some packaging',
        recyclability: 'Limited recycling options',
        common_products: ['Pipes', 'Wire insulation', 'Some bottles'],
        recycling_rate: 'Less than 1% in US',
        educational_note: 'Difficult to recycle due to chemical additives'
      },
      4: {
        code: 4,
        name: 'LDPE',
        full_name: 'Low-Density Polyethylene',
        description: 'Plastic bags, squeeze bottles, lids',
        recyclability: 'Limited curbside, special collection often needed',
        common_products: ['Plastic bags', 'Bread bags', 'Squeeze bottles'],
        recycling_rate: '5.7% in US (2018)',
        educational_note: 'Often requires special drop-off locations'
      },
      5: {
        code: 5,
        name: 'PP',
        full_name: 'Polypropylene',
        description: 'Yogurt containers, bottle caps, straws',
        recyclability: 'Increasingly accepted in recycling programs',
        common_products: ['Yogurt cups', 'Bottle caps', 'Food containers'],
        recycling_rate: '1.2% in US (2018)',
        educational_note: 'Growing acceptance in recycling programs'
      },
      6: {
        code: 6,
        name: 'PS',
        full_name: 'Polystyrene',
        description: 'Styrofoam cups, takeout containers, packing peanuts',
        recyclability: 'Very limited recycling options',
        common_products: ['Disposable cups', 'Takeout containers', 'Packing materials'],
        recycling_rate: 'Less than 1% in US',
        educational_note: 'One of the least recyclable plastics'
      },
      7: {
        code: 7,
        name: 'Other',
        full_name: 'Other plastics or mixed materials',
        description: 'Mixed plastics, some water bottles, electronics',
        recyclability: 'Generally not recyclable in standard programs',
        common_products: ['Some water bottles', 'Electronics', 'Composite materials'],
        recycling_rate: 'Varies widely',
        educational_note: 'Catch-all category for plastics not covered by 1-6'
      }
    };
  }
}

// Export singleton instance
const aiService = new AIService();

module.exports = aiService;