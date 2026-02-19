# Feature Specification: Rescan - Recycling Scanner Web Application

**Feature Branch**: `001-recycling-scanner-app`  
**Created**: 2026-02-19  
**Status**: Draft  
**Input**: User description: "I'm building a website application that will scan a RIC (recycling symbol code) and tell the user if the given product is recyclable in their area. For every item they enter into the website, points will be given. The user will be able to enter their street address so that we can track the points. The website will be able to determine if the product is recyclable given the local recycling capabilities."

## Educational Objectives *(mandatory for educational-first compliance)*

**Learning Goals**: 
- Understanding environmental impact through recycling awareness
- Learning about database operations (CRUD operations, address-based lookups)
- Exploring AI/ML integration through image recognition
- Web development concepts including responsive design and camera API integration
- Data visualization through points tracking systems

**Prerequisites**: Basic understanding of web technologies (HTML, CSS, JavaScript), database concepts, and environmental awareness
**Assessment**: Students will demonstrate understanding through successful implementation of camera integration, AI model interaction, and database operations
**Difficulty Level**: Intermediate

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Basic Address Entry and Points Lookup (Priority: P1)

A user visits the website, navigates through the home page, enters their street address, and sees their current recycling points total (or "You have no points" if new).

**Why this priority**: This establishes the core user flow and database foundation. It's the simplest viable product that demonstrates the points tracking system.

**Independent Test**: Can be fully tested by entering an address and verifying database lookup works correctly. Delivers immediate value by showing users their environmental impact score.

**Acceptance Scenarios**:

1. **Given** user visits home page, **When** they click "Yes" to reducing tax bill, **Then** they are taken to login page
2. **Given** user on login page, **When** they enter valid street address and submit, **Then** system displays "You have no points" for new address or actual points total for existing address
3. **Given** user has submitted address, **When** system displays points, **Then** user sees option to "scan an item and earn points"

---

### User Story 2 - Manual Image Upload and AI Recognition (Priority: P2)

A user uploads a photo of a recycling symbol (JPG/PNG), the system uses AI to identify the material type and recyclability, awarding appropriate points.

**Why this priority**: This delivers the core educational value about recycling while being technically simpler than camera integration. Users learn about RIC codes and local recycling capabilities.

**Independent Test**: Can be tested by uploading images with clear RIC symbols. Demonstrates AI integration and recycling education without camera complexity.

**Acceptance Scenarios**:

1. **Given** user on scan page, **When** they choose "Upload Image" option, **Then** they can select JPG or PNG file
2. **Given** user uploads image with RIC symbol, **When** AI processes image, **Then** system identifies material type (e.g., "1 PET", "5 PP") and recyclability status
3. **Given** item is recyclable, **When** AI confirms recyclability, **Then** user earns 100 points and database updates
4. **Given** item is not recyclable, **When** AI confirms non-recyclability, **Then** user earns 10 points and receives educational feedback

---

### User Story 3 - Camera Integration for Real-time Scanning (Priority: P3)

A user activates their device camera to capture photos of recycling symbols in real-time, providing the most seamless user experience.

**Why this priority**: While this provides the best user experience, it's technically complex and device-dependent. The core educational and functional value is already delivered in P1 and P2.

**Independent Test**: Can be tested on mobile and desktop devices with cameras. Provides enhanced usability but isn't essential for the core learning objectives.

**Acceptance Scenarios**:

1. **Given** user on scan page, **When** they click "Scan the Item" button, **Then** camera activates and shows live preview
2. **Given** camera is active, **When** user captures photo, **Then** image is processed same as manual upload
3. **Given** camera fails to activate, **When** system detects no camera, **Then** fallback to manual upload option is provided

---

### User Story 4 - Fun Home Page Engagement (Priority: P4)

A user who clicks "No" on the tax reduction question gets redirected to a fun video as an Easter egg engagement feature.

**Why this priority**: This is a fun engagement feature but doesn't contribute to core learning objectives or functionality.

**Independent Test**: Can be tested independently by clicking "No" on home page and verifying video iframe loads correctly.

**Acceptance Scenarios**:

1. **Given** user on home page, **When** they click "No" to tax reduction question, **Then** YouTube video opens in iframe

---

## Functional Requirements *(mandatory)*

**FR1 - Address Management**
- System captures and stores street addresses
- Database associates addresses with point totals
- Address lookup returns current points or zero for new addresses

**FR2 - AI-Powered Material Recognition**  
- Integration with Azure OpenAI GPT-4o model
- Image analysis identifies RIC symbols and material types
- System determines local recyclability based on address
- Returns material type (e.g., "1 PET", "5 PP") and recyclability status

**FR3 - Points System**
- Recyclable items award 100 points per scan
- Non-recyclable items award 10 points per scan  
- Points are persistently stored and associated with addresses
- Point totals are displayed to users

**FR4 - Responsive Web Interface**
- Works on mobile phones and desktop computers
- Sleek, standout visual design
- Camera integration where supported
- Image upload fallback for all devices

**FR5 - Image Capture Options**
- Primary: Real-time camera capture
- Fallback: Manual JPG/PNG upload
- Both methods feed into same AI processing pipeline

## Success Criteria *(mandatory)*

**User Experience Success**:
- 90% of users can successfully navigate from home page to seeing their points within 2 minutes
- Users can complete a recycling item scan (camera or upload) within 30 seconds
- Interface is fully functional on both mobile and desktop devices

**Educational Success**:
- Students demonstrate understanding of RIC recycling codes through successful item identification
- Users receive educational feedback about recyclability based on their location
- 80% of scanned items are correctly identified by the AI system

**Technical Success**:
- System accurately identifies RIC symbols in clear photos 85% of the time
- Database correctly tracks points per address with 100% accuracy
- AI response time averages under 5 seconds for image analysis
- Website loads and is interactive within 3 seconds

## Non-Functional Requirements *(mandatory)*

**Performance**: AI image analysis completes within 5 seconds, web pages load within 3 seconds
**Scalability**: Support for 100 concurrent users during class activities
**Reliability**: 95% uptime during school hours, graceful error handling for AI failures
**Security**: Secure image handling, no permanent storage of user photos
**Usability**: Accessible design following web standards, clear error messages for students

## Key Entities *(mandatory)*

**Address**
- street_address: String (primary key)
- points_total: Integer
- created_date: DateTime
- last_updated: DateTime

**Scan_Session**  
- session_id: String (primary key)
- address: String (foreign key)
- material_type: String (e.g., "1 PET")
- is_recyclable: Boolean
- points_awarded: Integer
- scan_timestamp: DateTime
- image_analysis_result: Text

## Assumptions *(if any)*

- Users have devices with camera capability or ability to upload images
- Azure OpenAI service will be available and responsive
- Local recycling capabilities data will be embedded in the AI prompt or accessible to the system
- Street addresses are sufficient for determining local recycling capabilities
- Users understand basic recycling concepts and RIC symbols

## Dependencies *(if any)*

- Azure OpenAI GPT-4o model access and API key
- Web camera API support in target browsers
- Database system for storing addresses and points
- Image file handling capabilities (JPG, PNG support)
- Responsive web framework for cross-device compatibility

## Out of Scope *(if any)*

- User authentication beyond address entry
- Complex recycling facility database integration
- Real-time recycling center availability
- Historical tracking beyond total points
- Social features or points sharing between users
- Payment processing or rewards redemption
