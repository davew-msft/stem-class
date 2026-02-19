# Research Findings: Rescan - Recycling Scanner Web Application

**Purpose**: Document technical decisions and research findings for implementation planning
**Created**: 2026-02-19
**Feature**: [spec.md](spec.md)

## Technology Stack Research

### Frontend Technology Decision
**Decision**: HTML5, CSS3, JavaScript (Vanilla + modern APIs)
**Rationale**: 
- Educational-first approach - students learn fundamental web technologies before frameworks
- MediaDevices API for camera integration is well-supported in modern browsers
- Simplicity principle - no complex build tools or dependencies to manage
- Responsive design teachable with CSS Grid and Flexbox
- Compatible with STEM class educational objectives

**Alternatives considered**: React, Vue.js
**Why rejected**: Adds complexity that obscures core web development learning objectives; students should master fundamentals first

### Backend Technology Decision
**Decision**: Node.js with Express.js
**Rationale**:
- JavaScript everywhere - reduces cognitive load for students learning full-stack development
- Express.js is simple and educational - clear to understand routing and middleware concepts
- Strong ecosystem for Azure OpenAI SDK integration
- SQLite perfect for educational environment - no server setup required

**Alternatives considered**: Python Flask, Python Django
**Why rejected**: While excellent for AI integration, introduces additional language complexity; JavaScript-based stack maintains consistency

### Database Decision
**Decision**: SQLite 
**Rationale**:
- SQLite perfect for classroom environment - no server setup required
- Students can visualize data easily with DB Browser for SQLite
- Simple schema aligns with educational objectives (just 2 tables needed)

**Alternatives considered**: MongoDB, MySQL
**Why rejected**: 
- MongoDB: NoSQL adds unnecessary complexity for simple relational data
- MySQL: More complex setup than SQLite, unnecessary for educational objectives

### AI Integration Decision
**Decision**: Azure OpenAI GPT-4o with direct API calls
**Rationale**:
- GPT-4o excellent for image analysis and text extraction
- Azure provides educational credits and classroom-friendly pricing
- Direct API integration teaches students about HTTP requests and API authentication
- Aligns with Microsoft educational ecosystem commonly used in schools

**Alternatives considered**: Google Vision API, AWS Rekognition
**Why rejected**: 
- Google Vision: Good for OCR but GPT-4o provides better context understanding
- AWS Rekognition: More complex setup, less suitable for educational environment

## Implementation Patterns Research

### Camera API Integration
**Decision**: MediaDevices.getUserMedia() with fallback to file upload
**Rationale**:
- Standard modern browser API - teaches students about progressive enhancement
- Graceful degradation to file upload maintains functionality across devices
- Clear error handling opportunities for educational debugging
- Supports both mobile and desktop environments

**Implementation approach**: Feature detection with user-friendly fallbacks

### File Upload Strategy
**Decision**: FormData API with client-side validation
**Rationale**:
- Native browser API reduces external dependencies
- Teaches students about HTTP multipart forms
- Client-side validation provides immediate feedback
- Server-side processing demonstrates security principles

**File handling**: Accept JPG, PNG; validate client-side; temporary server storage

### Points System Architecture
**Decision**: Simple database operations with address-based aggregation
**Rationale**:
- Straightforward CRUD operations teach database fundamentals
- Address-based lookup demonstrates primary key concepts
- Point calculations show business logic implementation
- No user authentication needed - simplifies educational focus

**Data flow**: Address → Points lookup → Scan → Points update → Display

## Educational Technology Integration

### Learning Management
**Decision**: Console logging + browser developer tools
**Rationale**:
- Teaches students to use debugging tools
- Real-time feedback for understanding code flow
- Aligns with observability constitutional principle
- No additional tools required

**Implementation**: Structured console.log statements at key decision points

### Progressive Complexity
**Decision**: P1→P2→P3→P4 feature implementation order
**Rationale**:
- P1: Database fundamentals (address lookup)
- P2: API integration (AI image analysis)
- P3: Hardware integration (camera API)
- P4: UX polish (engagement features)

**Educational progression**: Each phase builds on previous learning

## Security and Production Considerations

### API Security
**Decision**: Environment variables for Azure OpenAI API keys
**Rationale**:
- Teaches configuration management concepts
- Prevents credential exposure in code
- Industry standard practice for educational preparation

**Implementation**: .env file with clear documentation

### Image Handling
**Decision**: Temporary storage with automatic cleanup
**Rationale**:
- Privacy respect - images not permanently stored
- Resource management concepts
- Security principle demonstration

**Implementation**: Express middleware for upload handling, scheduled cleanup

## Performance and Scalability

### Classroom Environment
**Decision**: Optimized for 30 concurrent users
**Rationale**:
- Typical class size for STEM courses
- Allows testing of concurrent access concepts
- Realistic performance expectations for educational environment

**Monitoring**: Basic response time logging for student understanding

### AI Response Times
**Decision**: 5-second timeout with progress indicators
**Rationale**:
- Realistic expectation for GPT-4o image analysis
- Progress indicators teach UX design principles
- Error handling demonstrates robustness concepts

**Implementation**: Loading states and timeout handling

## Summary of Research Decisions

All technical choices prioritize educational value while maintaining real-world relevance. The stack teaches fundamental concepts (HTML/CSS/JS, HTTP APIs, databases) before introducing advanced patterns. Complexity is introduced progressively through the P1-P4 priority system, allowing students to master each concept before proceeding.

Key learning outcomes supported:
- Full-stack web development (frontend/backend separation)
- API integration and authentication (Azure OpenAI)
- Database design and operations (SQLite management and visualization)
- Modern web APIs (MediaDevices, FormData)
- Environmental awareness through practical application
- Debugging and observability practices