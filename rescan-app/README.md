# 🌍 RIC Recycling Scanner

A web application that scans RIC (Recycling Identification Code) symbols on plastic products to determine local recyclability and engage users through a points-based gamification system.

## ✨ Features

- 📱 **Camera Scanning**: Use device camera to scan RIC codes on plastic products
- 📍 **Location-Based Information**: Get recycling info specific to your street address
- ⭐ **Points System**: Earn points for environmental engagement
- 🌐 **Responsive Design**: Works seamlessly on mobile and desktop
- ♻️ **Educational Content**: Learn about plastic types and recycling best practices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Modern web browser with camera support

### 1. Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd rescan-app

# Copy environment variables
cp .env.example .env.local

# Update .env.local with your database connection
DATABASE_URL="postgresql://postgres:password@localhost:5432/ric_scanner"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

```bash
# Start PostgreSQL (using Docker is recommended)
docker run --name ric-scanner-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ric_scanner \
  -p 5432:5432 \
  -d postgres:15

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed with reference data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📱 Usage

### Scanning RIC Codes

1. **Camera Mode**: Click "Camera Scan" and point your camera at a plastic product's recycling symbol
2. **Manual Mode**: Switch to "Manual Entry" and type the RIC code number (1-7)
3. **View Results**: See if the item is recyclable in your area and earn points!

### Setting Your Location

1. Click "Add" or "Edit" next to your location in the profile section
2. Enter your street address for location-specific results
3. Get personalized recycling facility information

### Understanding RIC Codes

- **RIC 1 (PET)**: Water bottles, soda bottles → Usually recyclable
- **RIC 2 (HDPE)**: Milk jugs, detergent bottles → Usually recyclable  
- **RIC 3 (PVC)**: Pipes, some bottles → Limited recycling
- **RIC 4 (LDPE)**: Plastic bags, films → Special programs
- **RIC 5 (PP)**: Yogurt containers, caps → Increasingly recyclable
- **RIC 6 (PS)**: Styrofoam → Very limited recycling
- **RIC 7 (Other)**: Mixed materials → Generally not recyclable

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL with spatial data support
- **Camera**: react-camera-pro for device camera access
- **OCR**: Tesseract.js for image text recognition

### Project Structure

```
rescan-app/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── api/            # API endpoints
│   │   ├── layout.tsx      # App layout
│   │   └── page.tsx        # Main page
│   ├── components/         # React components
│   ├── lib/               # Utilities and data
│   └── types/             # TypeScript definitions
├── prisma/                # Database schema and seeds
└── public/               # Static assets
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:generate  # Generate Prisma client
npm run db:push     # Push schema to database  
npm run db:seed     # Seed reference data
npm run db:studio   # Open Prisma Studio

# Testing
npm run test        # Run unit tests
npm run test:e2e    # Run end-to-end tests
npm run lint        # Run ESLint
npm run type-check  # Check TypeScript types
```

### Adding New Features

1. Update the database schema in `prisma/schema.prisma`
2. Run `npm run db:push` to apply changes
3. Add API endpoints in `src/app/api/`
4. Create React components in `src/components/`
5. Update types in `src/types/index.ts`

### Testing

```bash
# Unit tests with Jest
npm run test

# E2E tests with Playwright
npm run test:e2e

# Test specific component
npm run test -- RicScanner
```

## 📊 API Endpoints

### Users
- `POST /api/users` - Create or get user by session ID
- `GET /api/users/[id]` - Get user profile
- `PATCH /api/users/[id]` - Update user location

### RIC Codes  
- `GET /api/ric-codes` - Get all RIC code information
- `POST /api/ric-codes/[code]/check` - Check recyclability and award points

### Response Examples

```json
// Scan result
{
  "scan_id": "uuid",
  "ric_code": 1,
  "is_recyclable_locally": true,
  "points_awarded": 2,
  "recyclability_reason": "Recyclable through curbside pickup...",
  "nearest_facilities": [...],
  "total_user_points": 15
}
```

## 🌍 Deployment

### Environment Variables

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="https://your-domain.com"
NODE_ENV="production"
```

### Production Setup

1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations and seeding
4. Deploy to your preferred platform (Vercel, Railway, etc.)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For questions or support:
- Check the [GitHub Issues](../../issues)
- Review the [documentation](specs/)
- Check the [quickstart guide](specs/001-ric-recycling-scanner/quickstart.md)

---

**Built with ♻️ for a sustainable future**