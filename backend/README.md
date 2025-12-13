# xCardGen Backend API

Welcome to the **xCardGen Backend**, the powerhouse behind the xCardGen platform. This application is built with **NestJS**, following a modular, scalable architecture designed to handle high-throughput event registration and dynamic image generation.

## 🚀 Technology Stack

- **Framework**: [NestJS 11](https://nestjs.com/) (Node.js 20+)
- **Language**: TypeScript 5.7
- **Database**: PostgreSQL 16 (Managed via [Prisma ORM](https://www.prisma.io/))
- **Authentication**: Passport.js (JWT Strategy, Google OAuth 2.0)
- **Queue Management**: Bull (Redis-backed) for asynchronous image processing
- **Image Processing**: Canvas API (node-canvas) & Puppeteer (Headless Browser)
- **Object Storage**: Cloudinary SDK
- **Payment Gateway**: Stripe (Custom implementation)
- **Testing**: Jest (Unit & E2E)

## 📂 Project Architecture

The project follows the standard NestJS modular structure, enforcing Separation of Concerns (SoC).

```
src/
├── auth/           # Authentication & Authorization (Guards, Strategies, Session Mgmt)
├── events/         # Event Management, Registration, and Public Access logic
├── generations/    # Core Engine: Card rendering and generation logic
├── payments/       # Subscription handling, Stripe webhooks, and Usage Credits
├── prisma/         # Database connection and Prisma Client wrapper
├── uploads/        # File upload handling (Cloudinary adapter)
├── users/          # User profile management
├── workspaces/     # Multi-tenant workspace isolation logic
├── common/         # Shared decorators, filters, and interceptors
└── main.ts         # Application entry point
```

### Key Design Patterns

- **Repository Pattern**: Abstracted via Prisma Service to decouple DB logic.
- **Queue-Based Processing**: Image generation is offloaded to a Redis queue (`Bull`) to prevent blocking the main event loop during high-load registrations.
- **Workspace Isolation**: Middleware and Prisma middleware ensure data leakage across workspaces is impossible.

## 🛠️ Installation & Setup

### Prerequisites

- Node.js v20.x or higher
- PostgreSQL Database
- Redis Server (Required for Queues)
- Cloudinary Account

### 1. Clone & Install

```bash
git clone <repo-url>
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory. See `.env.example` for reference.

```ini
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/xcardgen"

# Authentication
JWT_SECRET="super_secure_secret_key"
FRONTEND_URL="http://localhost:3000"

# OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_CALLBACK_URL="http://localhost:3001/auth/google/callback"

# Services
CLOUDINARY_URL="..."
REDIS_URL="redis://localhost:6379"

# Feature Flags
ENABLE_BILLING=true
```

### 3. Database Setup

Synchronize the Prisma schema with your database:

```bash
# Generate Prisma Client
npx prisma generate

# Run Migrations
npx prisma migrate dev

# Seed Initial Data (Plans, Admin)
npx prisma db seed
```

## ⚡ Running the Application

### Development Mode

Runs the application with hot-reload enabled.

```bash
npm run start:dev
```

### Production Mode

Builds the application to `dist/` and runs the optimized bundle.

```bash
npm run build
npm run start:prod
```

### Debug Mode

```bash
npm run start:debug
```

## 📚 API Module Breakdown

### Authentication (`/auth`)

- **Strategies**: Supports `jwt` (Bearer token) and `google` strategies.
- **Sessions**: Implements robust session tracking in the database (`Session` model) to allow revocation of specific devices.
- **Guards**: `JwtAuthGuard`, `WorkspaceGuard`, `RolesGuard`.

### Events (`/events`)

- **CRUD**: Create, Update, Publish events.
- **Registration**: Public endpoint for attendees to register.
- **Gating**: Enforces `maxAttendees` limits and credit consumption logic before registration.

### Generations (`/generations`)

- **Engine**: Combines HTML5 Canvas templates with dynamic user data.
- **Process**:
  1.  Receives generation request.
  2.  Pushes job to `generation-queue`.
  3.  Worker processes job: Renders image -> Uploads to Cloudinary -> Updates DB.
  4.  Triggers Webhook/Email (optional).

### Payments (`/payments`)

- **Logic**: Manages `SubscriptionPlan` (Free, Pro, Agency).
- **Credits**: Consumes `generationCount` per registration. Blocks actions if balance is zero.

## 🧪 Testing

We rely on Jest for testing.

```bash
# Unit Tests
npm run test

# End-to-End Tests
npm run test:e2e

# Test Coverage Report
npm run test:cov
```

## 🚢 Deployment (Digital Ocean / VPS)

We recommend using **PM2** and **Docker** for production deployment.

### PM2 Setup

```bash
npm install -g pm2
npm run build
pm2 start dist/src/main.js --name xcardgen-backend
```

### Database Migrations in Prod

Always run migrations before starting the new build:

```bash
npx prisma migrate deploy
```

## 📝 License

Proprietary software. All rights reserved.
