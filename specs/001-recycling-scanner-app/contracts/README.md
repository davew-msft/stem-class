# API Contracts Summary: Rescan - Recycling Scanner

**Purpose**: Quick reference for API endpoints and educational learning progression
**Created**: 2026-02-19  
**Full Specification**: [api-spec.yaml](api-spec.yaml)

## Educational Implementation Order

### Phase P1: Address Management (MVP Database Foundation)
**Learning Focus**: Database operations, HTTP basics, JSON handling

| Endpoint | Method | Purpose | Educational Value |
|----------|--------|---------|-------------------|
| `/api/address/lookup` | POST | Look up points for address | Database queries, input validation |
| `/api/health` | GET | System health check | HTTP GET, monitoring concepts |

**P1 Success Criteria**: Students can enter address and see points lookup working

### Phase P2: AI Integration (Core Learning Value)  
**Learning Focus**: AI/ML APIs, file handling, business logic

| Endpoint | Method | Purpose | Educational Value |
|----------|--------|---------|-------------------|
| `/api/scan/upload` | POST | Upload image for AI analysis | Multipart forms, AI integration, transactions |

**P2 Success Criteria**: Students can upload images and receive AI-powered recycling analysis

### Phase P3: Camera Enhancement (Advanced UX)
**Learning Focus**: Device APIs, real-time processing

| Endpoint | Method | Purpose | Educational Value |
|----------|--------|---------|-------------------|
| `/api/scan/camera` | POST | Process camera-captured images | Camera API integration, real-time processing |

**P3 Success Criteria**: Students can use device camera for seamless scanning experience

## Key Request/Response Patterns

### Address Lookup (P1)
```javascript
// Request
POST /api/address/lookup
{
  "street_address": "123 Main Street, Anytown, ST 12345"
}

// Response - New Address  
{
  "street_address": "123 Main Street, Anytown, ST 12345",
  "points_total": 0,
  "message": "You have no points",
  "first_visit": true
}

// Response - Existing Address
{
  "street_address": "123 Main Street, Anytown, ST 12345", 
  "points_total": 450,
  "message": "You have earned 450 recycling points!",
  "first_visit": false
}
```

### Image Upload and Analysis (P2)
```javascript
// Request (multipart/form-data)
POST /api/scan/upload
Content-Type: multipart/form-data

address=123 Main Street, Anytown, ST 12345
image=[binary JPG/PNG data]

// Response - Recyclable Item
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "material_type": "1 PET", 
  "is_recyclable": true,
  "points_awarded": 100,
  "new_total": 550,
  "educational_message": "Great work! PET plastic bottles are widely recyclable...",
  "ai_confidence": 0.92
}

// Response - Non-recyclable Item  
{
  "session_id": "550e8400-e29b-41d4-a716-446655440001",
  "material_type": "6 PS",
  "is_recyclable": false, 
  "points_awarded": 10,
  "new_total": 460,
  "educational_message": "Thanks for checking! Polystyrene unfortunately isn't accepted...",
  "ai_confidence": 0.87
}
```

## Error Handling Philosophy

**Educational-First Error Messages**: All errors include:
- `error`: Machine-readable error code for debugging
- `message`: Clear human-readable description  
- `educational_tip`: Learning-focused guidance for students
- `debug_info`: Additional technical details (development only)

### Common Error Patterns
```javascript
// Validation Error
{
  "error": "invalid_address_format",
  "message": "Address must be at least 5 characters and include street information", 
  "educational_tip": "Try including street number, name, city, and state"
}

// AI Processing Error
{
  "error": "no_symbol_detected",
  "message": "Could not identify a recycling symbol in the uploaded image",
  "educational_tip": "Make sure the recycling symbol is clearly visible and well-lit. Look for numbers 1-7 inside a triangle made of arrows."
}

// System Error
{
  "error": "ai_service_unavailable", 
  "message": "Unable to analyze image at this time",
  "educational_tip": "This could be a network issue or high usage. Try again in a few moments."
}
```

## Database Integration Points

| Endpoint | Database Operations | Learning Objectives |
|----------|-------------------|-------------------|
| `POST /address/lookup` | SELECT or INSERT Address | Primary keys, upsert patterns |
| `POST /scan/upload` | INSERT ScanSession + UPDATE Address | Transactions, foreign keys |

## AI Integration Learning

**Azure OpenAI Integration**: `/scan/upload` endpoint demonstrates:
- HTTP API authentication with API keys
- Image processing and analysis
- Natural language AI responses  
- Confidence scoring and error handling
- Environmental context awareness (recyclability by location)

## Progressive Enhancement Strategy

1. **P1**: Build working database operations - establishes backend foundation
2. **P2**: Add AI integration - demonstrates external API patterns  
3. **P3**: Enhance with camera - teaches device API integration
4. **P4**: Polish UX - focuses on user experience and engagement

Each phase builds on previous learning while introducing new concepts appropriately for STEM education context.