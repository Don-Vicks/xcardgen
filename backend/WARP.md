# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

XCard Generator backend - a NestJS application for generating and managing digital event cards. Built with TypeScript, Prisma ORM, PostgreSQL, and includes authentication, workspace management, and card generation capabilities.

## Development Commands

### Setup
```bash
npm install
npx prisma generate  # Generate Prisma client after schema changes
npx prisma migrate dev  # Run database migrations in development
npx prisma studio  # Open Prisma Studio to view/edit database
```

### Running the Application
```bash
npm run start:dev  # Development mode with hot-reload (primary dev command)
npm run start:debug  # Debug mode with hot-reload
npm run start  # Standard start without watch mode
npm run start:prod  # Production mode (requires build)
```

### Testing
```bash
npm test  # Run all unit tests
npm run test:watch  # Run tests in watch mode (useful when developing)
npm run test:cov  # Run tests with coverage report
npm run test:e2e  # Run end-to-end tests
npm run test:debug  # Run tests in debug mode
```

### Code Quality
```bash
npm run lint  # Lint and auto-fix TypeScript files
npm run format  # Format code with Prettier
npm run build  # Build production bundle
```

## Architecture

### Tech Stack
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript with decorators
- **Database**: PostgreSQL via Prisma ORM
- **Authentication**: JWT with Passport.js (local + JWT strategies)
- **Validation**: class-validator & class-transformer (global validation pipe enabled)
- **Password Hashing**: bcrypt
- **Planned/Available**: Bull (job queues), Cloudinary (image storage), Puppeteer (card generation), Redis (Bull queues)

### Database Architecture

Prisma schema defines a multi-tenant SaaS structure:

**Core Entities**:
- **User**: Authentication base, owns workspaces and events
- **Workspace**: Multi-tenant organization unit with owner and members (OWNER/ADMIN/MEMBER roles)
- **Template**: Design templates for cards (backgroundImage + properties JSON)
- **Event**: Card generation events linked to templates (DRAFT/PUBLISHED status)
- **Generation**: Individual card generation records with analytics (demographic, device, location)
- **Download**: Download tracking for analytics
- **Analytics**: Aggregated metrics per event
- **Subscriptions**: User subscription management with plans and status

**Key Relationships**:
- Users can own/be members of multiple Workspaces
- Events belong to Users and optionally Workspaces
- Each Event has one Template (1:1)
- Templates and Events can be workspace-scoped or personal
- Generations and Downloads track card usage per Event

**Prisma Client Location**: Generated to `generated/prisma` (custom output path, not default)

### Module Structure

**Feature Modules** (domain-driven):
- `auth/`: JWT + local auth, login/register, guards & strategies
- `users/`: User CRUD operations
- `xcard/`: Card generation operations (stub implementation)
- `events/`: Event management (stub implementation)
- `templates/`: Template management (stub implementation)

**Core Services**:
- `PrismaService`: Database client, extends PrismaClient with OnModuleInit for connection management
- `AppModule`: Root module importing all feature modules

**Auth Flow**:
- Uses Passport LocalStrategy for login (email/password)
- JwtStrategy validates JWT tokens from Authorization header
- `@UseGuards(JwtAuthGuard)` protects routes
- `@User()` custom decorator extracts user from request
- JWT secret from `JWT_SECRET` env var (fallback: 'your-secret-key')
- Token expiry: 24h

### Application Configuration
- Global validation pipe with whitelist & transform enabled
- CORS enabled globally
- Port: `process.env.PORT ?? 3000`
- TypeScript: ES2023 target, nodenext modules, strict null checks

## Development Patterns

### Creating New Modules
Use NestJS CLI to scaffold consistent module structure:
```bash
nest g module <name>  # Generate module
nest g controller <name>  # Generate controller
nest g service <name>  # Generate service
nest g resource <name>  # Generate complete CRUD resource (recommended)
```

### Database Changes
1. Modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <migration_name>` to create and apply migration
3. Run `npx prisma generate` to update Prisma client (if not auto-generated)

### Adding Protected Routes
```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

@UseGuards(JwtAuthGuard)
@Get('protected')
someMethod(@User() user) {
  // user contains JWT payload
}
```

### Testing a Single Test File
```bash
npm test -- <filename>  # e.g., npm test -- auth.service.spec.ts
npm run test:watch -- <filename>  # Watch mode for specific file
```

## Important Notes

- Prisma client is generated to `generated/prisma` directory (not standard `node_modules`)
- Import Prisma client as: `import { PrismaClient } from 'generated/prisma'`
- Many service implementations are currently stubs (xcard, events, templates modules)
- Dependencies like Bull, Cloudinary, and Puppeteer are installed but not yet integrated
- JWT secret should be set via `JWT_SECRET` environment variable
- LoginLog creation in `auth.service.ts` is missing required fields (deviceId, ipAddress)
