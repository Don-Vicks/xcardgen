# xCardGen Monorepo

Welcome to the **xCardGen Monorepo**. This repository houses the complete source code for the xCardGen platform, a comprehensive solution for event organizers to generate, manage, and distribute digital attendee cards and badges.

## 🌟 Project Overview

xCardGen is designed to solve the problem of manual event badge creation. It provides:

1.  **Drag-and-Drop Editor**: Create beautiful templates in the browser.
2.  **Instant Generation**: generate thousands of personalized cards in seconds.
3.  **Workspace Isolation**: Manage multiple organizations or clients from a single account.
4.  **Monetization**: Built-in subscription and credit system (Stripe).

## 🏗️ Architecture

The codebase is organized as a **Monorepo** to facilitate code sharing and unified development.

```
xcardgen/
├── backend/          # NestJS API Server (The Brain)
├── frontend/         # Next.js 16 Web Application (The Face)
├── types/            # Shared TypeScript Definitions (The Glue)
├── .github/          # CI/CD Workflows
└── README.md         # You are here
```

### Services

| Service      | Technology                 | Port   | Description                                                               |
| :----------- | :------------------------- | :----- | :------------------------------------------------------------------------ |
| **Backend**  | NestJS, Prisma, PostgreSQL | `3001` | Handles API requests, DB operations, Authentication, and Async Jobs.      |
| **Frontend** | Next.js, React, Tailwind   | `3000` | The dashboard for organizers and public registration pages for attendees. |
| **Database** | PostgreSQL 16              | `5432` | Primary data store.                                                       |
| **Queue**    | Redis                      | `6379` | Message broker for background jobs.                                       |

## 🚀 Getting Started (Day 1)

Follow these steps to get the entire stack running locally.

### 1. Prerequisites

- Node.js v20+ (LTS recommended)
- npm or yarn
- PostgreSQL running locally (or connection string to cloud DB)
- Redis running locally

### 2. Installation

Install dependencies for all workspaces from the root.

```bash
npm install
```

### 3. Backend Setup

Navigate to the backend directory and configure it.

```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials
npx prisma migrate dev  # Sync Database
npm run start:dev       # Start API
```

_Leave this terminal running._

### 4. Frontend Setup

Open a new terminal, navigate to the frontend directory.

```bash
cd frontend
cp .env.example .env.local
# Ensure NEXT_PUBLIC_BACKEND_URL points to http://localhost:3001
npm run dev
```

### 5. Access the App

- **Web App**: [http://localhost:3000](http://localhost:3000)
- **API Health**: [http://localhost:3001/api/health](http://localhost:3001/api/health)
- **Swagger Docs**: [http://localhost:3001/api](http://localhost:3001/api)

## 🤝 Contribution Guidelines

1.  **Branching**: Use `feature/xyz` or `fix/issue-id` branches. Do not push directly to `main`.
2.  **Commits**: We follow Conventional Commits (e.g., `feat: add new layer type`, `fix: resolve login bug`).
3.  **Code Style**:
    - **Backend**: Follows NestJS standard style (Prettier + ESLint).
    - **Frontend**: React Hooks rules, Tailwind class sorting.
4.  **Types**: Always update the `types/` package if you are changing DTOs shared between FE and BE.

## 📦 Deployment Strategy

### Option A: Separate Services (Recommended)

- Deploy **Frontend** to **Vercel** (Zero config, edge cache).
- Deploy **Backend** to **Digital Ocean / AWS EC2** via Docker or PM2.

### Option B: Monolithic Deployment

- Use Docker Compose to spin up both services + DB + Redis on a single VPS. (See `docker-compose.yml` if available).

## 📄 License

Copyright © 2025 xCardGen. All rights reserved.
