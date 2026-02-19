# 🌱 Rescan - Educational Recycling Scanner

**A STEM class project teaching full-stack web development through environmental awareness**

Rescan is an educational web application where students learn modern web development by building a tool that promotes environmental responsibility. Students scan or upload photos of recycling symbols, and AI identifies the material type and recyclability, awarding points for environmental awareness.

## 🎯 Learning Objectives

By building this project, students will master:

- **🗃️ Database Operations**: SQLite setup, CRUD operations, primary/foreign keys, transactions
- **🌐 REST API Development**: Express.js routing, middleware, request/response handling
- **🤖 AI Integration**: Azure OpenAI image analysis, API authentication, error handling
- **📱 Responsive Design**: Mobile-first CSS, progressive enhancement, user experience
- **🔧 Full-Stack Architecture**: Frontend/backend separation, API communication
- **♻️ Environmental Science**: Recycling codes (RIC), local recyclability, impact tracking

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** ([Download](https://nodejs.org/))
- **VS Code** ([Download](https://code.visualstudio.com/))
- **Azure OpenAI API access** (instructor will provide)

### Setup Instructions

1. **Clone and Setup**
   ```bash
   git clone [repository-url]
   cd rescan
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Azure OpenAI credentials (ask instructor)
   ```

3. **Initialize Database**
   ```bash
   npm run db:setup
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

## 📚 Educational Path

### Phase 1: Database Foundation (P1 - MVP)
**Focus**: Learn database operations and user interface basics
- ✅ Address entry system
- ✅ Points lookup and storage
- ✅ Responsive web design fundamentals

**Test**: Enter address → see points total → understand database flow

### Phase 2: AI Integration (P2 - Core Learning)  
**Focus**: External API integration and image processing
- ✅ File upload handling
- ✅ Azure OpenAI integration
- ✅ Material identification
- ✅ Points calculation logic

**Test**: Upload recycling symbol → get AI analysis → earn points

### Phase 3: Camera Integration (P3 - Enhancement)
**Focus**: Device APIs and progressive enhancement
- ✅ Camera permissions
- ✅ Real-time photo capture
- ✅ Fallback strategies

**Test**: Use camera → capture image → same AI processing

### Phase 4: Polish (P4)
**Focus**: User experience and deployment
- ✅ Easter egg features
- ✅ Performance optimization
- ✅ Error handling improvement

## 🏗️ Project Structure

```
rescan/
├── backend/                 # Server-side code
│   ├── src/
│   │   ├── models/         # Database models (Address, ScanSession)
│   │   ├── services/       # Business logic (Database, AI service)
│   │   ├── api/            # Express routes and server setup
│   │   └── config/         # Database and environment configuration
│   └── public/             # Static files and uploads
├── frontend/               # Client-side code
│   └── src/
│       ├── pages/          # HTML pages (home, login, scan)
│       ├── components/     # Reusable JS modules (camera, upload)
│       ├── services/       # API communication
│       └── assets/         # CSS, JavaScript, images
├── data/                   # SQLite database storage
├── docs/                   # Educational documentation
└── specs/                  # Project specifications and planning
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server with auto-reload
npm run start           # Start production server

# Database
npm run db:setup        # Create database and tables
npm run db:reset        # Delete and recreate database

# Code Quality
npm run lint            # Check code style with ESLint
npm run format          # Format code with Prettier
npm run test:manual     # Run manual testing scenarios

# Educational
npm run explain         # Show learning objectives and progress
```

## 🧪 Manual Testing Guide

### Database Testing (Phase 1)
```bash
# Test address creation and lookup
curl -X POST http://localhost:3000/api/address/lookup \\
  -H \"Content-Type: application/json\" \\
  -d '{\"street_address\":\"123 Test St, Anytown, ST 12345\"}'

# Expected: {\"street_address\":\"...\",\"points_total\":0,\"message\":\"You have no points\",\"first_visit\":true}
```

### AI Integration Testing (Phase 2)
```bash
# Test image upload (requires sample image)
curl -X POST http://localhost:3000/api/scan/upload \\
  -F \"address=123 Test St, Anytown, ST 12345\" \\
  -F \"image=@sample-recycling-image.jpg\"

# Expected: Material identification and points awarded
```

### Frontend Testing
1. **Navigate**: home page → click \"Yes\" → address entry → scan page
2. **Upload**: Choose image file → verify AI response → check points update
3. **Camera**: Click camera button → grant permissions → capture photo
4. **Responsive**: Test on mobile and desktop browsers

## 🐛 Troubleshooting

### Common Issues

**Database locked error**
```bash
# Solution: Close any open database connections
rm data/rescan.db && npm run db:setup
```

**API key errors**
```bash
# Check .env file has correct Azure OpenAI credentials
cat .env | grep AZURE_OPENAI
```

**Camera not working**
- Ensure HTTPS in production (localhost is OK for development)
- Check browser permissions for camera access
- Verify MediaDevices API support

**Port already in use**
```bash
# Change PORT in .env file or kill existing process
lsof -ti:3000 | xargs kill -9
```

### Getting Help

1. **Check the logs**: Console shows detailed educational debugging
2. **Read the error**: Error messages are written to be learning-friendly
3. **Ask classmates**: Peer programming encouraged!
4. **Consult instructor**: Don't hesitate to ask for clarification

## 🌍 Environmental Impact Learning

### Recycling Codes (RIC) Education
- **Code 1 (PET)**: Plastic bottles - widely recyclable
- **Code 2 (HDPE)**: Milk jugs, detergent bottles - recyclable
- **Code 3 (PVC)**: Pipes, credit cards - rarely recyclable
- **Code 4 (LDPE)**: Plastic bags - special collection needed
- **Code 5 (PP)**: Yogurt containers - increasingly recyclable  
- **Code 6 (PS)**: Styrofoam - rarely recyclable
- **Code 7 (Other)**: Mixed plastics - varies by location

### Discussion Questions
- How does technology help solve environmental problems?
- What role does local infrastructure play in recyclability?
- How can data tracking change environmental behaviors?
- What are the challenges in automating sustainability decisions?

## 🏆 Assessment Criteria

### Technical Skills (60%)
- [ ] **Database Operations**: Can explain and implement CRUD operations
- [ ] **API Development**: Creates RESTful endpoints with proper error handling
- [ ] **Frontend Integration**: Builds responsive interfaces that communicate with backend
- [ ] **Problem Solving**: Debugs issues using logs, error messages, and systematic approach

### Environmental Learning (25%)
- [ ] **RIC Knowledge**: Understands recycling codes and material types
- [ ] **Local Awareness**: Recognizes that recyclability depends on location and infrastructure
- [ ] **Behavioral Impact**: Can articulate how technology influences environmental choices

### Collaboration & Communication (15%)
- [ ] **Code Quality**: Writes readable, well-commented code
- [ ] **Documentation**: Maintains clear commit messages and documentation
- [ ] **Peer Assistance**: Helps classmates and asks for help appropriately

## 📈 Extensions & Advanced Projects

After completing the core project:

1. **Data Visualization**: Add charts showing recycling trends
2. **Location Services**: Integrate maps to find nearby recycling centers  
3. **Social Features**: Create classroom leaderboards or challenges
4. **Mobile App**: Convert to React Native or Progressive Web App
5. **Machine Learning**: Train custom models for better symbol detection
6. **Environmental API**: Integrate real recycling facility data

## 📄 License & Educational Use

This project is designed specifically for educational purposes in STEM classrooms. 

**MIT License** - Free to use, modify, and distribute for educational purposes.

**Educational Attribution**: When adapting this project, please maintain the educational comments and learning objectives to benefit other students and instructors.

---

**Built with 💚 for STEM education and environmental awareness**

*Questions? Issues? Ideas for improvement? Open an issue or ask your instructor!*