# Session Management Guide

## Overview

This backend now implements a robust session management system that tracks user sessions, handles logout, and validates active sessions on every request.

## How It Works

### 1. **Login Creates a Session**

When a user logs in via `POST /auth/login`:

- User credentials are validated
- JWT token is generated
- **Session is created** in the database with:
  - Token (the JWT)
  - IP address
  - User agent
  - Expiry time (24 hours)
  - Active status (true)

### 2. **Every Request Validates the Session**

When a protected route is accessed with `@UseGuards(JwtAuthGuard)`:

- JWT token is extracted from `Authorization: Bearer <token>` header
- JWT signature is validated
- **Session is checked** in the database:
  - Must exist
  - Must be active (`isActive: true`)
  - Must not be expired
- Session's `lastActivity` timestamp is updated
- User data is attached to request

### 3. **Logout Revokes the Session**

When user logs out via `POST /auth/logout`:

- Session is marked as inactive (`isActive: false`)
- `revokedAt` timestamp is set
- Token becomes invalid immediately

## API Endpoints

### Login

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

# Response
{
  "user": { ... },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Logout (Single Device)

```bash
POST /auth/logout
Authorization: Bearer <token>

# Response
{
  "message": "Logged out successfully"
}
```

### Logout All Devices

```bash
POST /auth/logout-all
Authorization: Bearer <token>

# Response
{
  "message": "Logged out from 3 device(s)",
  "count": 3
}
```

### Get Active Sessions

```bash
GET /auth/sessions
Authorization: Bearer <token>

# Response
[
  {
    "id": "uuid",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "lastActivity": "2025-10-24T15:20:00Z",
    "createdAt": "2025-10-24T10:00:00Z",
    "expiresAt": "2025-10-25T10:00:00Z"
  }
]
```

## Using @CurrentUser() Decorator

### In Controllers

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/user.decorator';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  // Get current user in controller
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@CurrentUser() user: any, @Body() dto: CreateEventDto) {
    // user contains: { id, email, name, createdAt, updatedAt }
    console.log('Current user:', user.id);

    return this.eventsService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-events')
  async getMyEvents(@CurrentUser() user: any) {
    return this.eventsService.findByUserId(user.id);
  }
}
```

### In Services (Pass from Controller)

```typescript
// Controller
@UseGuards(JwtAuthGuard)
@Post('events')
async createEvent(@CurrentUser() user: any, @Body() dto: CreateEventDto) {
  // Pass user.id to service
  return this.eventsService.create(user.id, dto);
}

// Service
@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        ...dto,
        userId, // Use the passed userId.
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.event.findMany({
      where: { userId },
    });
  }
}
```

## Type-Safe User Object

Create a type for the current user:

```typescript
// src/auth/types/current-user.type.ts
export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
```

Then use it:

```typescript
import { CurrentUser as CurrentUserType } from '../auth/types/current-user.type';

@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile(@CurrentUser() user: CurrentUserType) {
  return user;
}
```

## Session Service Methods

The `SessionService` provides these methods:

```typescript
// Create a session (called automatically on login)
await sessionService.createSession(userId, token, ipAddress, userAgent);

// Find active session
const session = await sessionService.findActiveSession(token);

// Update last activity (called automatically on each request)
await sessionService.updateSessionActivity(token);

// Revoke specific session (logout)
await sessionService.revokeSession(token);

// Revoke all user sessions (logout all devices)
const count = await sessionService.revokeAllUserSessions(userId);

// Get user's active sessions
const sessions = await sessionService.getUserActiveSessions(userId);

// Revoke other sessions except current (logout other devices)
const count = await sessionService.revokeOtherSessions(userId, currentToken);

// Cleanup expired sessions (run via cron)
const count = await sessionService.cleanupExpiredSessions();
```

## Database Schema

The `Session` model:

```prisma
model Session {
  id           String    @id @default(uuid())
  userId       String
  token        String    @unique
  ipAddress    String
  userAgent    String
  deviceId     String?
  expiresAt    DateTime
  isActive     Boolean   @default(true)
  lastActivity DateTime  @default(now())
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  revokedAt    DateTime?
  user         User      @relation(...)
}
```

## Security Features

1. **Token Validation**: JWT signature is validated
2. **Session Validation**: Database check ensures session is active
3. **Expiry Check**: Sessions expire after 24 hours
4. **Activity Tracking**: Last activity timestamp updated on each request
5. **Revocation**: Sessions can be instantly revoked (logout)
6. **Multi-Device Support**: Users can see and revoke sessions per device
7. **IP & User Agent Tracking**: Helps identify suspicious activity

## Best Practices

1. **Always use @UseGuards(JwtAuthGuard)** on protected routes
2. **Pass user.id to services** instead of passing entire user object
3. **Don't store sensitive data** in JWT payload (it's just id and email)
4. **Set up a cron job** to cleanup expired sessions periodically
5. **Monitor session activity** for suspicious patterns

## Migration Steps

1. Generate Prisma client with new Session model:

   ```bash
   cd backend
   npx prisma generate
   ```

2. Create and apply migration:

   ```bash
   npx prisma migrate dev --name add-session-management
   ```

3. Test the endpoints:

   ```bash
   # Login
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'

   # Get sessions (use token from login)
   curl http://localhost:3000/auth/sessions \
     -H "Authorization: Bearer <token>"

   # Logout
   curl -X POST http://localhost:3000/auth/logout \
     -H "Authorization: Bearer <token>"
   ```

## Future Enhancements

- Add refresh tokens for long-lived sessions
- Implement session limits per user
- Add geolocation tracking
- Send email alerts for new logins
- Add "Trust this device" feature
- Implement sliding session expiration
