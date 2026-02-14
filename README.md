# Neuro Sensory Cognitive App

Full-stack web application with:
- Node.js + Express backend
- React frontend (Vite)
- MongoDB persistence
- JWT authentication
- Sensory test modules and results dashboard

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

Update `server/.env` if needed.

### 4) Run in development
```bash
npm run dev
```

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

### API endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/sensory/modules` (auth)
- `POST /api/sensory/results` (auth)
- `GET /api/sensory/results` (auth)
- `GET /api/sensory/dashboard` (auth)

