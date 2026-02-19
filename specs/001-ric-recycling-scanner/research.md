# Research: RIC Recycling Scanner Technical Decisions

**Date**: February 17, 2026  
**Feature**: [RIC Recycling Scanner](spec.md)  
**Purpose**: Resolve technical clarifications identified in implementation planning

## Research Findings

### Camera/Computer Vision Library Selection

**Decision**: React-Camera-Pro + Tesseract.js
**Rationale**: React-Camera-Pro provides excellent mobile browser support with responsive video elements and built-in error handling. Tesseract.js offers client-side OCR processing via WebAssembly, perfect for recognizing RIC code numbers (1-7) without requiring server processing.

**Alternatives considered**:
- Native getUserMedia (too much implementation overhead)
- TensorFlow.js (overkill for simple number recognition)  
- OpenCV.js (unnecessary complexity)
- ZXing-js (designed for barcodes, not printed numbers)

**Implementation approach**: Progressive enhancement starting with photo capture + OCR processing, evolving toward real-time scanning capabilities.

### Testing Framework Selection

**Decision**: Jest + React Testing Library + Playwright + MSW
**Rationale**: Industry-standard React testing with Jest/RTL for unit tests, Playwright for comprehensive E2E testing with excellent mobile emulation, and MSW for API mocking. This combination provides full coverage from component testing to end-to-end user journeys.

**Alternatives considered**:
- Cypress (less mobile support than Playwright)
- Puppeteer (less comprehensive than Playwright)
- Pure Jest E2E (insufficient for complex camera workflows)

**Camera testing strategy**: Mock getUserMedia APIs at unit level, use device emulation and mock streams for E2E testing.

### Performance Goals & Scale Requirements

**Decision**: Target municipal service scale with excellent mobile performance
**Rationale**: Based on research of similar environmental applications and municipal service usage patterns.

**Specific targets**:
- **Response times**: Camera scan 2-4s, location lookup 300ms, recycling data 150ms
- **Scale**: Support 500-2,000 concurrent users (medium city scale)  
- **Database**: PostgreSQL queries <200ms for geospatial lookups
- **Mobile**: Optimize for 3G/4G connectivity with offline RIC code caching

**User engagement expectations**:
- 2-5 minute average sessions
- 5-15% monthly active users from service area
- 70% mobile usage pattern

### Geographic Data Scope

**Decision**: Street-level precision with municipal/regional coverage
**Rationale**: Balances accuracy requirements with data availability and processing complexity.

**Coverage planning**:
- **Address precision**: 10-50 meter accuracy for location matching
- **Facility scale**: 200-1,000 recycling facilities for medium city
- **Data volume**: <1GB total storage for moderate scale deployment
- **Update frequency**: Monthly facility updates, quarterly address updates

## Implementation Phases

### Phase 1 (MVP): Basic Functionality
- Manual photo capture with Tesseract.js OCR
- ZIP code level recycling information
- Basic points tracking

### Phase 2 (Enhanced): Location Precision  
- Street-level location matching
- Image preprocessing for better OCR accuracy
- Real-time scanning capabilities

### Phase 3 (Advanced): Optimization
- Automatic RIC symbol detection
- Offline capability with cached data
- Performance optimization for high traffic

## Technical Stack Finalization

Based on research findings and user requirements:

- **Frontend**: Next.js 14+ with React, TypeScript
- **Camera**: React-Camera-Pro for device access
- **OCR**: Tesseract.js for RIC number recognition
- **Database**: PostgreSQL with PostGIS for geospatial queries
- **Testing**: Jest + React Testing Library + Playwright + MSW
- **Deployment**: Web-first SPA with responsive mobile design

## Risk Mitigation

**Identified challenges**:
1. **OCR accuracy**: Implement image preprocessing and validation
2. **Browser compatibility**: Progressive enhancement with manual entry fallback  
3. **Performance on older devices**: Optimize processing pipeline
4. **Data accuracy**: Establish reliable recycling facility data sources

**Mitigation strategies**:
- Hybrid approach with manual entry as fallback
- Comprehensive device testing across browser matrix
- Performance monitoring and optimization
- Data validation and regular facility database updates