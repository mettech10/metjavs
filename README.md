# Multimodal Neuro-Sensory Cognitive Risk Assessment Platform

Production-oriented full-stack reference implementation using:
- **Frontend:** React 18 + TypeScript + Tailwind + Framer Motion + Recharts
- **Backend:** Node.js/Express + TypeScript + JWT + RBAC
- **Database:** PostgreSQL + Prisma ORM

## Clinical modules implemented
- Visual screening (logMAR-oriented workflow scaffolding + classification)
- Hearing screening (DIN-oriented workflow scaffolding + placeholder audio assets)
- Olfactory screening (home items and odor card mode scaffolding)
- Composite fusion score and clinician-adjustable weights

## Security/HIPAA-aware controls
- JWT auth, role-based authorization
- Input sanitization and API rate limiting
- HTTPS enforcement middleware
- PII encryption helper for sensitive demographics
- Audit logging for data access/actions

## Exports
- PDF report endpoint and client PDF render
- CSV export endpoint
- Excel export endpoint

## Developer setup
```bash
npm run install:all
cp server/.env.example server/.env
npm run dev
```

### Prisma
```bash
npm run prisma:generate --workspace server
npm run prisma:migrate --workspace server
npm run prisma:seed --workspace server
```

### Testing
```bash
npm run test --workspace server
npm run test --workspace client
```

## Demo acceleration
- `POST /api/sessions/dev/simulate` auto-completes sensory + composite sessions with realistic randomized values.

## Disclaimer
**This tool is for screening purposes only and does not constitute a medical diagnosis.**
