# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

XCard Generator - A full-stack application for generating and managing digital event cards. Monorepo structure with separate frontend (Next.js) and backend (NestJS) services.

## Repository Structure

```
xcardgen/
├── frontend/     # Next.js 15 frontend with Turbopack, Konva canvas, and Cloudinary
├── backend/      # NestJS backend with Prisma, PostgreSQL, JWT auth
└── README.md     # Project notes
```

## Quick Start

### Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev  # Runs on http://localhost:3000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:3000 (or different port if backend is on 3000)
```

## Development Workflow

### Working on Backend
Navigate to `backend/` directory. See `backend/WARP.md` for detailed backend-specific guidance including:
- NestJS module structure and patterns
- Prisma database operations
- Authentication/authorization flow
- Testing and linting commands

### Working on Frontend
Navigate to `frontend/` directory for all frontend development.

**Commands**:
```bash
npm run dev    # Development server with Turbopack (fast refresh)
npm run build  # Production build with Turbopack
npm run start  # Start production server
npm run lint   # ESLint checking
```

**Tech Stack**:
- **Framework**: Next.js 15 (App Router)
- **Bundler**: Turbopack (fast development builds)
- **Styling**: Tailwind CSS 4
- **Canvas**: Konva (for card design/manipulation)
- **Image Management**: next-cloudinary
- **HTTP Client**: Axios
- **TypeScript**: Strict mode enabled

**Key Features**:
- App Router with TypeScript
- Font optimization with Geist Sans and Geist Mono
- Path alias `@/*` maps to project root
- Environment variables for Cloudinary integration

### Running Both Services
In development, you'll typically need both services running:
1. Terminal 1: `cd backend && npm run start:dev`
2. Terminal 2: `cd frontend && npm run dev`

Note: Both default to port 3000, so one will auto-increment to 3001.

## Architecture Overview

### Frontend (Next.js)
- **Type**: React 19 + Next.js 15 App Router
- **Rendering**: Server components by default, client components as needed
- **Styling**: Tailwind CSS 4 with PostCSS
- **Canvas Library**: Konva for card design/generation
- **Image Uploads**: Cloudinary via next-cloudinary
- **API Communication**: Axios (connects to NestJS backend)

**Current State**: Minimal setup (default Next.js template), needs implementation

### Backend (NestJS)
- **Type**: Node.js REST API with TypeScript
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: JWT tokens with Passport.js strategies
- **Architecture**: Module-based (auth, users, events, templates, xcard)
- **Data Model**: Multi-tenant SaaS with Workspaces, Events, Templates, Generations

See `backend/WARP.md` for comprehensive backend details.

### Data Flow
1. Frontend (Next.js) → HTTP requests via Axios
2. Backend (NestJS) → REST API endpoints
3. Backend → Prisma ORM → PostgreSQL database
4. Cloudinary (both) → Image storage and CDN

## Environment Variables

### Frontend (.env)
```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="<Your Cloud Name>"
NEXT_PUBLIC_CLOUDINARY_API_KEY="<Your API Key>"
CLOUDINARY_API_SECRET="<Your API Secret>"
```

### Backend (.env)
Required environment variables (not committed):
```bash
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
PORT=3000  # Optional, defaults to 3000
```

## Common Tasks

### Database Operations
```bash
cd backend
npx prisma migrate dev --name <migration_name>  # Create migration
npx prisma generate                             # Update client after schema changes
npx prisma studio                               # Open database GUI
```

### Running Tests
```bash
# Backend tests
cd backend
npm test              # Unit tests
npm run test:e2e      # E2E tests
npm run test:cov      # Coverage report

# Frontend tests
cd frontend
# No test configuration yet
```

### Code Quality
```bash
# Backend
cd backend
npm run lint    # Lint and fix TypeScript
npm run format  # Prettier formatting

# Frontend  
cd frontend
npm run lint    # ESLint only
```

### Building for Production
```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm run start
```

## Development Notes

- Backend has comprehensive architecture with Prisma schema defining multi-tenant structure
- Frontend is minimal setup (default template) - card generation UI needs implementation
- Both services include dependencies for Cloudinary integration
- Backend includes Bull (job queues) and Puppeteer (for potential server-side card rendering)
- Konva on frontend suggests client-side canvas-based card editing
- Backend Prisma client generates to custom path: `generated/prisma`

## Project Status

**Backend**: Partially implemented
- ✅ Auth system (JWT + local strategies)
- ✅ Database schema (comprehensive multi-tenant structure)
- ✅ User management
- ⚠️ Events, Templates, XCard modules are stubs
- ⚠️ Bull queues and Puppeteer not yet integrated

**Frontend**: Initial setup only
- ✅ Next.js 15 with App Router
- ✅ Tailwind CSS 4 configured
- ✅ Konva and Cloudinary dependencies installed
- ⚠️ No UI implementation yet (default template)
- ⚠️ No API integration with backend

## Troubleshooting

**Port conflicts**: If both services try to use port 3000, the second will increment automatically. Check console output for actual ports.

**Prisma client issues**: Backend uses custom output path. Always import as `import { PrismaClient } from 'generated/prisma'`

**Frontend environment variables**: Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.
