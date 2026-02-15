# Neuro Sensory Cognitive App

A full-stack application with:
- Node.js + Express backend
- React frontend (Vite)
- MongoDB persistence
- JWT authentication
- Interactive sensory test modules
- Results dashboard with per-module analytics

## Features
- Register/Login authentication
- Protected sensory testing and dashboard routes
- Three interactive modules:
  - Reaction Time test (fast click timing)
  - Memory Sequence test (recall challenge)
  - Focus Score test (timed click accuracy)
- Automatic result storage to MongoDB
- Dashboard summary cards + recent sessions table

## Local setup

### 1) Prerequisites
- Node.js 18+
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### 2) Install dependencies
```bash
npm run install:all
```

### 3) Configure environment
```bash
cp server/.env.example server/.env
```

Edit `server/.env` if needed.

### 4) Run in development
```bash
npm run dev
```

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

## API endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/sensory/modules` (auth)
- `POST /api/sensory/results` (auth)
- `GET /api/sensory/results` (auth)
- `GET /api/sensory/dashboard` (auth)
