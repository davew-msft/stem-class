/**
 * AI Service for Recycling Symbol Recognition
 * 
 * Educational Focus:
 * - Azure OpenAI integration patterns
 * - Image analysis and machine learning concepts
 * - Error handling in AI systems
 * - Confidence scoring and validation
 * - Educational prompt engineering techniques
 * 
 * This service demonstrates how to integrate AI into educational applications
 * while maintaining proper error handling and educational value.
 */

const { OpenAI } = require('openai');
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
   * Initialize Azure OpenAI client with educational error handling
   */
  async initialize() {
    try {
      if (!process.env.AZURE_OPENAI_API_KEY) {
        logger.warn('Azure OpenAI API key not configured - using mock responses for educational demonstration');
        this.isInitialized = false;
        return false;
      }

      if (!process.env.AZURE_OPENAI_ENDPOINT) {
        logger.warn('Azure OpenAI endpoint not configured - using mock responses');
        this.isInitialized = false;
        return false;
      }

      // Initialize Azure OpenAI client
      this.client = new OpenAI({
        apiKey: process.env.AZURE_OPENAI_API_KEY,
        baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
        defaultQuery: { 'api-version': '2024-02-15-preview' },
        defaultHeaders: {
          'api-key': process.env.AZURE_OPENAI_API_KEY,
        }
      });

      // Test the connection with a simple request
      await this.testConnection();
      
      this.isInitialized = true;
      logger.info('Azure OpenAI service initialized successfully');
      return true;

    } catch (error) {
      logger.error('Failed to initialize Azure OpenAI service:', error);
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

    const response = await this.client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
      messages: [{ role: 'user', content: 'Test connection - respond with "OK"' }],
      max_tokens: 10
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error('Invalid response from Azure OpenAI service');
    }

    logger.info('Azure OpenAI connection test successful');
  }

  /**
   * Analyze uploaded image for recycling symbols
   * Returns educational analysis with confidence scoring
   */
  async analyzeRecyclingImage(imagePath, originalFileName = 'uploaded_image') {
    try {
      logger.info(`Starting AI analysis for image: ${originalFileName}`);

      // Check if file exists
      await fs.access(imagePath);
      
      // Get file stats for logging
      const stats = await fs.stat(imagePath);
      logger.info(`Analyzing image: ${originalFileName}, Size: ${stats.size} bytes`);

      let analysisResult;

      if (this.isInitialized && this.client) {
        // Use real Azure OpenAI analysis
        analysisResult = await this.performRealAIAnalysis(imagePath, originalFileName);
      } else {
        // Use educational mock analysis for demonstration
        logger.info('Using mock AI analysis for educational demonstration');
        analysisResult = await this.performMockAIAnalysis(imagePath, originalFileName);
      }

      // Enhance result with educational content
      analysisResult.educational = this.getEducationalContent(analysisResult.material_type, analysisResult.ric_code);
      
      // Add confidence validation
      analysisResult.confidence_analysis = this.analyzeConfidence(analysisResult.confidence);

      logger.info(`AI analysis completed for ${originalFileName}: ${analysisResult.material_type}, Confidence: ${analysisResult.confidence}%`);
      
      return analysisResult;

    } catch (error) {
      logger.error('Error in AI image analysis:', error);
      
      // Return educational error response
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
        material_type: 'unknown',
        ric_code: null,
        points: 0
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

      // Parse AI response into structured format
      return this.parseAIResponse(aiResponse, fileName);

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
      // Try to parse JSON response
      let parsed;
      try {
        parsed = JSON.parse(aiResponse);
      } catch (jsonError) {
        // If not JSON, extract using regex patterns
        parsed = this.extractFromTextResponse(aiResponse);
      }

      // Validate and normalize response
      const result = {
        success: true,
        material_type: this.normalizeMaterialType(parsed.material_type || parsed.material),
        ric_code: this.normalizeRICCode(parsed.ric_code || parsed.ric),
        confidence: Math.min(Math.max(parseInt(parsed.confidence) || 50, 0), 100),
        description: parsed.description || 'AI-identified recycling symbol',
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

    // Generate realistic mock response based on common scenarios
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
        material_type: 'cardboard',
        ric_code: null,
        description: 'Corrugated cardboard packaging',
        confidence: 92,
        recyclable: true,
        educational_note: 'Cardboard is highly recyclable when clean and dry'
      },
      {
        material_type: 'plastic',
        ric_code: 5,
        description: 'PP (Polypropylene) container',
        confidence: 70,
        recyclable: true,
        educational_note: 'PP recycling availability varies by location'
      }
    ];

    // Select random scenario or base on filename patterns
    const scenario = fileName.toLowerCase().includes('bottle') ? mockScenarios[0] :
                    fileName.toLowerCase().includes('cardboard') ? mockScenarios[2] :
                    mockScenarios[Math.floor(Math.random() * mockScenarios.length)];

    return {
      success: true,
      ...scenario,
      points: this.calculatePoints(scenario.material_type, scenario.ric_code, scenario.confidence),
      ai_analysis: {
        processing_method: 'mock_analysis_for_education',
        timestamp: new Date().toISOString(),
        note: 'This is a simulated AI response for educational purposes'
      }
    };
  }

  /**
   * Calculate points based on material type, RIC code, and confidence
   */
  calculatePoints(materialType, ricCode, confidence) {
    let basePoints = 0;

    // Base points by material type
    const materialPoints = {
      plastic: 10,
      cardboard: 8,
      paper: 6,
      glass: 12,
      metal: 15,
      aluminum: 18
    };

    basePoints = materialPoints[materialType] || 5;

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
   * Normalize material type to standard categories
   */
  normalizeMaterialType(type) {
    if (!type) return 'unknown';
    
    const normalized = type.toLowerCase().trim();
    
    // Common mappings
    if (normalized.includes('plastic') || normalized.includes('polymer')) return 'plastic';
    if (normalized.includes('cardboard') || normalized.includes('corrugated')) return 'cardboard';
    if (normalized.includes('paper')) return 'paper';
    if (normalized.includes('glass')) return 'glass';
    if (normalized.includes('aluminum') || normalized.includes('aluminium')) return 'aluminum';
    if (normalized.includes('metal') || normalized.includes('steel')) return 'metal';
    
    return normalized;
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
    const info = {
      plastic: {
        description: 'Plastic materials made from petroleum-based polymers',
        common_uses: ['Bottles', 'Containers', 'Packaging', 'Bags'],
        decomposition_time: '450-1000 years',
        recycling_process: 'Melting and reforming into new products'
      },
      cardboard: {
        description: 'Paper-based material with corrugated structure',
        common_uses: ['Shipping boxes', 'Packaging', 'Food containers'],
        decomposition_time: '2-5 months',
        recycling_process: 'Pulping and reforming into new paper products'
      },
      paper: {
        description: 'Cellulose-based material from wood pulp',
        common_uses: ['Documents', 'Newspapers', 'Books', 'Packaging'],
        decomposition_time: '2-6 weeks',
        recycling_process: 'De-inking and pulping into new paper'
      },
      glass: {
        description: 'Silica-based material that can be infinitely recycled',
        common_uses: ['Bottles', 'Jars', 'Windows', 'Containers'],
        decomposition_time: '1 million years+',
        recycling_process: 'Melting and reforming without quality loss'
      }
    };

    return info[materialType] || {
      description: 'Material type not recognized',
      common_uses: [],
      decomposition_time: 'Unknown',
      recycling_process: 'Varies by material'
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
    const tips = {
      plastic: [
        'Remove caps and lids if required by local facility',
        'Rinse containers to remove food residue',
        'Check local guidelines for accepted plastic types',
        'Avoid putting plastic bags in curbside bins'
      ],
      cardboard: [
        'Remove all tape, staples, and plastic elements',
        'Break down boxes to save space',
        'Keep cardboard dry and clean',
        'Separate pizza boxes if greasy'
      ],
      paper: [
        'Remove plastic windows from envelopes',
        'Separate different paper types if required',
        'Avoid contamination with food or liquids',
        'Staples are usually OK to leave in'
      ],
      glass: [
        'Remove lids and caps',
        'Rinse containers clean',
        'Separate by color if required locally',
        'Be careful with broken glass'
      ]
    };

    return tips[materialType] || ['Check local recycling guidelines'];
  }

  /**
   * Get environmental impact information
   */
  getEnvironmentalImpact(materialType) {
    const impacts = {
      plastic: {
        recycling_benefit: 'Saves petroleum, reduces ocean pollution',
        energy_savings: 'Uses 88% less energy than making new plastic',
        co2_reduction: 'Reduces CO2 emissions by 1-2 tons per ton recycled'
      },
      cardboard: {
        recycling_benefit: 'Saves trees, reduces landfill waste',
        energy_savings: 'Uses 75% less energy than making new cardboard',
        co2_reduction: 'Every ton recycled saves 1 cubic yard of landfill space'
      },
      paper: {
        recycling_benefit: 'Preserves forests, saves water',
        energy_savings: 'Uses 60% less energy than making new paper',
        co2_reduction: 'Each ton recycled saves 17 trees'
      },
      glass: {
        recycling_benefit: 'Infinite recyclability without quality loss',
        energy_savings: 'Uses 30% less energy than making new glass',
        co2_reduction: 'Every 10% increase in glass recycling reduces CO2 by 5%'
      }
    };

    return impacts[materialType] || {
      recycling_benefit: 'Reduces waste and conserves resources',
      energy_savings: 'Generally saves energy compared to new production',
      co2_reduction: 'Helps reduce greenhouse gas emissions'
    };
  }

  /**
   * Get educational prompts for AI analysis
   */
  getEducationalPrompts() {
    return {
      system_prompt: `You are an expert recycling symbol recognition AI designed for educational purposes. 
Your role is to analyze images and identify recycling symbols, material types, and provide educational information.

Analysis Guidelines:
1. Look for recycling symbols, numbers, and material indicators
2. Identify RIC codes (1-7 for plastics) when visible
3. Determine material type (plastic, cardboard, paper, glass, metal)
4. Assess recyclability based on common guidelines
5. Provide confidence scores based on symbol clarity

Response Format: Return a JSON object with these fields:
{
  "material_type": "plastic|cardboard|paper|glass|metal|aluminum",
  "ric_code": 1-7 for plastics or null for other materials,
  "confidence": confidence percentage (0-100),
  "description": "Clear description of what you see",
  "recyclable": true/false based on general guidelines,
  "reasoning": "Why you made this determination"
}

Educational Focus: Your analysis should help users learn about recycling symbols and environmental impact.`,

      analysis_prompt: `Please analyze this image for recycling symbols and materials:

1. Look for recycling symbol triangles with numbers (RIC codes 1-7)
2. Identify the material type (plastic, cardboard, paper, glass, etc.)
3. Assess the clarity of any recycling symbols visible
4. Determine general recyclability based on common guidelines
5. Provide a confidence score based on how clearly you can see the symbols

Focus on educational value - explain what you see and why it leads to your conclusion.
If symbols are unclear or partially visible, note this in your confidence scoring.

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