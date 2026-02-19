# Quickstart Guide: RIC Recycling Scanner

**Feature**: RIC Recycling Scanner  
**Last Updated**: February 17, 2026  
**Prerequisites**: Next.js 14+, Node.js 18+, PostgreSQL with PostGIS

## Overview

This guide helps you set up and run the RIC Recycling Scanner feature locally. Users can scan recycling codes via camera to learn about local recyclability and earn engagement points.

## Quick Setup (5 minutes)

### 1. Environment Setup
```bash
# Clone and navigate to project
git checkout 001-ric-recycling-scanner
cd rescan-app

# Install dependencies  
npm install

# Install additional packages for this feature
npm install react-camera-pro tesseract.js @types/tesseract.js
npm install prisma @prisma/client
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev @playwright/test playwright
```

### 2. Database Setup
```bash
# Start PostgreSQL with PostGIS (Docker recommended)
docker run --name ric-scanner-db \
  -e POSTGRES_PASSWORD=dev_password \
  -e POSTGRES_DB=ric_scanner \
  -p 5432:5432 \
  -d postgis/postgis:15-3.3

# Configure environment
cp .env.example .env.local
```

**.env.local**:
```env
DATABASE_URL="postgresql://postgres:dev_password@localhost:5432/ric_scanner"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Schema
```bash
# Generate Prisma client and run migrations
npx prisma generate
npx prisma db push

# Seed with RIC code reference data
npx prisma db seed
```

### 4. Start Development
```bash
# Run the development server
npm run dev

# Open browser to http://localhost:3000
```

## Core User Flows

### 1. Basic RIC Code Scanning

**User Journey**: Anonymous user → camera scan → recyclability result → points

```bash
# Test this flow:
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"session_id": "test-session-123"}'

# Response: {"id": "user-uuid", "total_points": 0, ... }

curl -X POST http://localhost:3000/api/ric-codes/1/check \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-uuid",
    "scan_method": "camera",
    "location": {"lat": 40.7128, "lng": -74.0060}
  }'

# Response: {"is_recyclable_locally": true, "points_awarded": 1, ...}
```

### 2. Location-Based Results

**User Journey**: User provides address → location-specific recycling info

```bash
# Update user location
curl -X PATCH http://localhost:3000/api/users/user-uuid \
  -H "Content-Type: application/json" \
  -d '{"street_address": "123 Main Street, New York, NY 10001"}'

# Check recyclability with street-level precision
curl -X POST http://localhost:3000/api/ric-codes/7/check \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-uuid", 
    "scan_method": "camera"
  }'
```

### 3. Points and Engagement

**User Journey**: View accumulated points and scan history

```bash
# Get user profile with points
curl http://localhost:3000/api/users/user-uuid

# Get scan history  
curl http://localhost:3000/api/users/user-uuid/scans?limit=10
```

## Frontend Integration

### Camera Scanner Component
```jsx
// components/RicScanner.jsx
import { Camera } from 'react-camera-pro';
import Tesseract from 'tesseract.js';

export function RicScanner() {
  const camera = useRef(null);
  
  const handleCapture = async () => {
    const image = camera.current.takePhoto();
    const { data: { text } } = await Tesseract.recognize(image, 'eng', {
      whitelist: '1234567'
    });
    
    // Send to API for recyclability check
    const result = await checkRecyclability(text.trim());
    setResult(result);
  };

  return (
    <div>
      <Camera ref={camera} aspectRatio={16/9} />
      <button onClick={handleCapture}>Scan RIC Code</button>
    </div>
  );
}
```

### API Integration
```jsx
// services/scanner-api.js
export async function checkRecyclability(ricCode, userId, location) {
  const response = await fetch(`/api/ric-codes/${ricCode}/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      scan_method: 'camera',
      location
    })
  });
  
  return response.json();
}

export async function createUser(sessionId) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId })
  });
  
  return response.json();
}
```

## Testing Your Implementation

### Unit Tests
```bash
# Test API endpoints
npm run test api/ric-codes

# Test React components
npm run test components/RicScanner

# Test database models
npm run test lib/models
```

### E2E Testing
```bash
# Install Playwright browsers
npx playwright install

# Run camera workflow tests
npm run test:e2e -- --grep "camera scanning"

# Test mobile responsiveness  
npm run test:e2e -- --project="Mobile Chrome"
```

### Manual Testing Checklist
- [ ] Camera permission request works
- [ ] RIC code scanning produces results  
- [ ] Location-based recyclability differs by area
- [ ] Points accumulate correctly
- [ ] Mobile interface responds properly
- [ ] Fallback manual entry works without camera

## Development Tips

### Camera Development
```bash
# For HTTPS local development (required for camera)
npm run dev:https

# Or use mkcert for local SSL
mkcert -install
mkcert localhost
```

### Database Queries
```sql
-- Test spatial queries for recycling capabilities
SELECT facility_name, accepted_ric_codes 
FROM recycling_capability 
WHERE ST_Contains(service_area, ST_Point(-74.0060, 40.7128));

-- Check user points calculation
SELECT u.total_points, COUNT(s.id) as scan_count
FROM users u 
LEFT JOIN scans s ON u.id = s.user_id 
WHERE u.id = 'user-uuid' 
GROUP BY u.id;
```

### Performance Monitoring
```bash
# Monitor API response times
npm run monitor:api

# Check camera processing performance
console.time('ric-scan');
await processRicImage(image);
console.timeEnd('ric-scan');
```

## Common Issues

### Camera Not Working
- **Issue**: getUserMedia permission denied
- **Fix**: Ensure HTTPS in production, localhost in development
- **Alternative**: Implement manual entry fallback

### OCR Accuracy Problems  
- **Issue**: Tesseract can't read RIC codes reliably
- **Fix**: Add image preprocessing (grayscale, contrast)
- **Enhancement**: Implement region-of-interest selection

### Location Services
- **Issue**: Address geocoding fails
- **Fix**: Add fallback to ZIP code level matching
- **Monitor**: Log geocoding success rates

## Next Steps

1. **Deploy to staging** with HTTPS enabled
2. **Test on real mobile devices** for camera performance  
3. **Populate recycling facility data** for your target area
4. **Set up monitoring** for scan success rates
5. **Implement analytics** for user engagement tracking

## API Documentation

- **Full API spec**: [contracts/api.yaml](contracts/api.yaml)
- **Data model**: [data-model.md](data-model.md)
- **Research decisions**: [research.md](research.md)

## Support

For implementation questions:
- Check the [spec.md](spec.md) for requirements clarification
- Review [research.md](research.md) for technical decisions  
- Test against the OpenAPI spec in `contracts/`