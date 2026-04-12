# FoodBridge 🌿

A hyperlocal food marketplace connecting small food producers with consumers in their community.

## Project Structure

```
foodbridge/
├── client/    # React + TypeScript + Tailwind CSS (frontend)
└── server/    # Node.js + Express + PostgreSQL (backend)
```

## Quick Start

### Backend
```bash
cd server
npm install
cp .env.example .env   # fill in your values
npm run dev
```

### Frontend
```bash
cd client
npm install
cp .env.example .env   # fill in your values
npm run dev
```

## Docs
- `FoodBridge_SRD_v1.0.docx` — Software Requirements
- `FoodBridge_SystemDesign_v1.0.docx` — Architecture & Schema
- `FoodBridge_SetupGuide_v1.0.docx` — Full setup instructions

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS, React Query |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (Supabase in production) |
| Media | Cloudinary |
| Deployment | Vercel (client) + Railway (server) |
