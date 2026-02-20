# Quickstart Guide: Rescan - Recycling Scanner Web Application

**Purpose**: Step-by-step guide for STEM students to build the recycling scanner application
**Created**: 2026-02-19
**Difficulty Level**: Intermediate
**Estimated Time**: 4-6 class periods (50 minutes each)

## 🎯 Learning Objectives

By completing this project, you will learn:
- **Database Operations**: CRUD operations, primary/foreign keys, transactions
- **API Development**: REST endpoints, request/response patterns, error handling  
- **AI Integration**: Working with Azure OpenAI for image analysis
- **Web Development**: Responsive design, camera APIs, file uploads
- **Environmental Awareness**: Recycling codes, local recyclability, impact tracking

## 📋 Prerequisites

### Knowledge Requirements
- Basic HTML, CSS, and JavaScript
- Understanding of databases and SQL concepts
- Familiarity with command line/terminal
- Basic understanding of HTTP and APIs

### Software Setup
- **Node.js** (v18 or later) - [Download here](https://nodejs.org/)
- **Visual Studio Code** - [Download here](https://code.visualstudio.com/)
- **Git** for version control
- **Azure OpenAI API Key** (instructor will provide for class)

### Optional Tools for Enhanced Learning
- **DB Browser for SQLite** - to visualize database contents
- **Postman** or **Thunder Client** (VS Code extension) - for API testing

## 🚀 Quick Setup

### 1. Clone and Initialize Project
```bash
# Navigate to your development folder
cd ~/Desktop/stem-projects

# Clone the project repository  
git clone [repository-url] rescan-app
cd rescan-app

# Switch to your feature branch
git checkout 001-recycling-scanner-app

# Install dependencies
npm install
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit configuration (instructor will provide Azure API key)
code .env
```

Update `.env` with provided values:
```bash
AZURE_OPENAI_API_KEY=your_api_key_here
AZURE_OPENAI_ENDPOINT=your_endpoint_here
DATABASE_URL=sqlite:./data/rescan.db
PORT=3000
```

### 3. Database Setup
```bash
# Create database and tables
npm run db:setup

# Verify database creation
ls -la data/
```

### 4. Start Development Server
```bash
# Start backend server
npm run dev

# Open browser to http://localhost:3000
# You should see the home page with "Do you want to reduce your tax bill?"
```

## 📚 Learning Path: Progressive Implementation

### Phase P1: Database Foundation (Class Period 1-2)
**Goal**: Build working address lookup and points display system

#### P1.1 - Setup Database Operations
**File**: `backend/src/services/dbService.js`

**Learning Focus**: Database connections, SQL operations, error handling

```javascript
// Key concepts to implement:
// - Database connection management
// - Address lookup with case-insensitive search  
// - Address creation for new users
// - Points calculation and updates
```

**Test Your Progress**:
```bash
# Test database operations
npm run test:db

# Manual test - enter address on homepage 
# Expected: See "You have no points" for new address
```

#### P1.2 - Build Address API Endpoint
**File**: `backend/src/api/routes/address.js`

**Learning Focus**: REST API design, request validation, JSON responses

```javascript
// Key concepts to implement:
// - POST /api/address/lookup endpoint
// - Input validation and sanitization
// - Database integration
// - Educational error messages
```

**Test Your Progress**:
```bash
# Test API directly
curl -X POST http://localhost:3000/api/address/lookup \
  -H "Content-Type: application/json" \
  -d '{"street_address":"123 Test Street, City, ST 12345"}'

# Expected response: {"street_address":"...","points_total":0,"message":"You have no points","first_visit":true}
```

#### P1.3 - Connect Frontend to Backend 
**Files**: `frontend/src/pages/login.html`, `frontend/src/services/api.js`

**Learning Focus**: Frontend-backend communication, async/await, DOM manipulation

**Test Your Progress**: Complete address entry flow from homepage → login → points display

**🎓 P1 Learning Checkpoint**:
- [ ] Can explain SQL SELECT and INSERT operations
- [ ] Understands HTTP POST requests and JSON responses
- [ ] Can trace data flow from frontend form to database
- [ ] Recognizes primary key concepts in Address table

---

### Phase P2: AI Integration (Class Period 3-4)
**Goal**: Upload images and receive AI-powered recycling analysis

#### P2.1 - File Upload Handling  
**File**: `backend/src/api/routes/scan.js`

**Learning Focus**: Multipart forms, file validation, temporary storage

```javascript
// Key concepts to implement:
// - multer middleware for file uploads
// - Image format validation (JPG, PNG only)
// - File size limits and error handling
// - Temporary storage management
```

**Test Your Progress**:
```bash
# Test file upload endpoint
curl -X POST http://localhost:3000/api/scan/upload \
  -F "address=123 Test Street, City, ST 12345" \
  -F "image=@test-images/recycling-symbol.jpg"
```

#### P2.2 - Azure OpenAI Integration
**File**: `backend/src/services/aiService.js`

**Learning Focus**: AI API integration, image analysis, error handling

```javascript
// Key concepts to implement:
// - Azure OpenAI client initialization
// - Image encoding and API requests
// - Response parsing for material type and recyclability
// - Confidence scoring and fallback handling
```

**Educational AI Prompt Template**:
```javascript
const prompt = `Looking at this image, can you:
1. Identify any recycling symbol (numbers 1-7 in triangle)
2. Determine the material type (e.g., "1 PET", "5 PP")
3. Based on the address "${userAddress}", is this recyclable locally?

Please respond with ONLY this format:
Material: [type]
Recyclable: [yes/no]
Confidence: [0.0-1.0]`;
```

#### P2.3 - Points Calculation and Database Updates
**File**: `backend/src/services/dbService.js` (extend existing)

**Learning Focus**: Database transactions, business logic, data integrity

```javascript
// Key concepts to implement:
// - Transaction management for atomic operations
// - ScanSession record creation
// - Address points_total updates  
// - Rollback handling for failures
```

**Test Your Progress**: Upload test images and verify points are awarded correctly

**🎓 P2 Learning Checkpoint**:
- [ ] Understands API authentication and external service integration
- [ ] Can explain database transactions and why they're needed
- [ ] Recognizes AI confidence scores and error handling
- [ ] Knows how to test API endpoints with file uploads

---

### Phase P3: Camera Integration (Class Period 5)  
**Goal**: Enable real-time camera scanning for enhanced user experience

#### P3.1 - Camera API Implementation
**File**: `frontend/src/components/camera.js`

**Learning Focus**: Browser device APIs, permissions, real-time processing

```javascript
// Key concepts to implement:
// - MediaDevices.getUserMedia() for camera access
// - Permission handling and user feedback
// - Canvas for image capture and processing
// - Base64 encoding for API transmission
```

#### P3.2 - Progressive Enhancement  
**File**: `frontend/src/pages/scan.html`

**Learning Focus**: Feature detection, graceful degradation, accessibility

```javascript
// Key concepts to implement:
// - Feature detection for camera capabilities
// - Fallback to file upload for unsupported devices
// - User feedback for camera status
// - Error handling for camera failures
```

**Test Your Progress**: Test camera functionality on mobile and desktop devices

**🎓 P3 Learning Checkpoint**:
- [ ] Understands browser security model and permissions
- [ ] Can implement feature detection patterns
- [ ] Knows how to handle device API failures gracefully
- [ ] Recognizes accessibility considerations

---

### Phase P4: Polish and Enhancement (Optional - Class Period 6)
**Goal**: Add engagement features and deployment considerations

#### P4.1 - Easter Egg Implementation
**Learning Focus**: User experience design, conditional logic

#### P4.2 - Responsive Design Enhancement  
**Learning Focus**: Mobile-first design, CSS media queries

#### P4.3 - Production Deployment Preparation
**Learning Focus**: Environment configuration, security considerations

## 🧪 Testing Scenarios

### Manual Testing Checklist

**P1 - Address Operations**:
- [ ] Enter new address → See "You have no points"
- [ ] Enter same address again → See consistent points total  
- [ ] Test with different address formats → Verify normalization
- [ ] Try invalid addresses → See educational error messages

**P2 - Image Analysis**:
- [ ] Upload clear recycling symbol → Get correct material identification
- [ ] Upload recyclable item → Earn 100 points
- [ ] Upload non-recyclable item → Earn 10 points  
- [ ] Upload image without symbol → See helpful error message
- [ ] Try unsupported file formats → See format guidance

**P3 - Camera Integration**:
- [ ] Camera activates successfully → See live preview
- [ ] Capture image → Same analysis as manual upload
- [ ] Camera fails/unavailable → Falls back to file upload
- [ ] Test on different devices → Consistent experience

### Database Testing
```bash
# View database contents (educational visualization)
sqlite3 data/rescan.db

# Check addresses table
.tables
SELECT * FROM Address;

# Check scan sessions  
SELECT * FROM ScanSession ORDER BY scan_timestamp DESC LIMIT 5;
```

## 🐛 Common Issues and Solutions

### Database Issues
**Problem**: `Database locked` error
**Solution**: Ensure only one process is accessing SQLite file
**Learning**: Database concurrency concepts

**Problem**: Foreign key constraint violation
**Solution**: Ensure address exists before creating scan session
**Learning**: Referential integrity importance

### API Issues  
**Problem**: `CORS error` in browser
**Solution**: Configure CORS middleware in Express
**Learning**: Browser security model

**Problem**: `401 Unauthorized` from Azure OpenAI
**Solution**: Check API key configuration in .env
**Learning**: API authentication concepts

### Frontend Issues
**Problem**: Camera not working
**Solution**: Ensure HTTPS for production, localhost OK for development  
**Learning**: Browser security requirements

**Problem**: File upload fails
**Solution**: Check file size limits and format validation
**Learning**: Input validation importance

## 📊 Learning Assessment

### Knowledge Check Questions
1. **Database**: Explain why we use transactions when awarding points
2. **API Design**: What's the difference between POST and GET, and why do we use POST for address lookup?
3. **AI Integration**: How would you handle AI service failures in production?
4. **Security**: Why do we validate file uploads on both frontend and backend?
5. **Environmental**: How does this application promote environmental awareness?

### Extension Projects
- Add historical scan data visualization
- Implement recycling center finder by location  
- Create environmental impact calculator
- Add social features for classroom challenges
- Build admin dashboard for teacher oversight

## 🌱 Environmental Learning Integration

### Recycling Education Opportunities
- **RIC Codes**: Learn about plastic types 1-7 and their properties
- **Local Recycling**: Understand how location affects recyclability  
- **Environmental Impact**: Discuss how recycling reduces waste and conserves resources
- **Behavior Change**: Track how points system encourages sustainable choices

### Discussion Questions
- How does technology help solve environmental problems?
- What challenges exist in recycling different materials?
- How can data tracking change environmental behaviors?
- What role does education play in sustainability?

## 🚀 Next Steps

After completing this project:
1. **Deploy to Production**: Learn about cloud deployment with Azure/Heroku
2. **Add Features**: Implement extension projects based on student interest
3. **Share Results**: Present environmental impact data to school community
4. **Iterate**: Gather user feedback and improve the application

**Congratulations!** You've built a full-stack web application that combines technology skills with environmental awareness. This project demonstrates real-world software development while contributing to sustainability education.

## 📞 Getting Help

**During Class**:
- Ask instructor for code review and guidance
- Work with classmates for peer debugging
- Use console.log() liberally for understanding program flow

**Resources**:
- [API Documentation](contracts/README.md)
- [Data Model Guide](data-model.md) 
- [Technical Research](research.md)
- [MDN Web Docs](https://developer.mozilla.org/) for web API reference
- [Node.js Documentation](https://nodejs.org/docs/) for backend development