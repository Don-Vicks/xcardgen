import { Injectable } from '@nestjs/common';
import { Session } from 'generated/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new session for a user
   * @param userId
   * @param token
   * @param ipAddress
   * @param userAgent
   * @param deviceId
   * @returns
   */
  async createSession(
    userId: string,
    token: string,
    ipAddress: string,
    userAgent: string,
    deviceId?: string,
  ): Promise<Session> {
    // Calculate expiry (24 hours from now, matching JWT expiry)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return this.prisma.session.create({
      data: {
        userId,
        token,
        ipAddress,
        userAgent,
        deviceId,
        expiresAt,
        isActive: true,
      },
    });
  }

  /**
   * Find an active session by token
   */
  async findActiveSession(token: string): Promise<Session | null> {
    return this.prisma.session.findFirst({
      where: {
        token,
        isActive: true,
        expiresAt: {
          gt: new Date(), // Not expired
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  /**
   * Update session last activity timestamp
   */
  async updateSessionActivity(token: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: {
        token,
        isActive: true,
      },
      data: {
        lastActivity: new Date(),
      },
    });
  }

  /**
   * Revoke (logout) a specific session
   */
  async revokeSession(token: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: {
        token,
        isActive: true,
      },
      data: {
        isActive: false,
        revokedAt: new Date(),
      },
    });
  }

  async revokeSessionById(sessionId: string, userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: {
        id: sessionId,
        userId, // Ensure user owns the session
        isActive: true,
      },
      data: {
        isActive: false,
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Revoke all sessions for a user (logout from all devices)
   */
  async revokeAllUserSessions(userId: string): Promise<number> {
    const result = await this.prisma.session.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
        revokedAt: new Date(),
      },
    });

    return result.count;
  }

  /**
   * Get all active sessions for a user
   */
  async getUserActiveSessions(userId: string): Promise<Session[]> {
    return this.prisma.session.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        lastActivity: 'desc',
      },
    });
  }

  /**
   * Clean up expired sessions (run periodically via cron)
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.prisma.session.deleteMany({
      where: {
        OR: [
          {
            expiresAt: {
              lt: new Date(),
            },
          },
          {
            isActive: false,
            revokedAt: {
              lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Older than 30 days
            },
          },
        ],
      },
    });

    return result.count;
  }

  /**
   * Revoke other sessions except current one (useful for "logout other devices")
   */
  async revokeOtherSessions(
    userId: string,
    currentToken: string,
  ): Promise<number> {
    const result = await this.prisma.session.updateMany({
      where: {
        userId,
        isActive: true,
        token: {
          not: currentToken,
        },
      },
      data: {
        isActive: false,
        revokedAt: new Date(),
      },
    });

    return result.count;
  }
}
