import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { LoginDto, LoginLogDto } from './dto/login.dto';
// import { loginSchema } from '@xcardgen/types';
// import { loginSchema } from '@xcardgen/types';
import { SessionService } from './session.service';
// import { loginSchema } from '@xcardgen/types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private sessionService: SessionService,
  ) {}

  async login(loginDto: LoginDto, logingLog: LoginLogDto) {
    const { email, password } = loginDto;
    const { ipAddress, userAgent } = logingLog;

    // const { error } = await loginSchema.safeParse({ email, password });
    // if (error) {
    //   return {
    //     status: 'error',
    //     message: error,
    //   };
    // }
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.generateToken(user);

    // Create session
    await this.sessionService.createSession(
      user.id,
      accessToken,
      ipAddress,
      userAgent,
    );

    // Log the login
    await this.logLogin(user.id, ipAddress, userAgent);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        workspaceMemberships: user.workspaceMemberships,
        workspaceOwnerships: user.workspaceOwnerships,
      },
      accessToken,
    };
  }

  async loginGoogle(user: any) {
    let existingUser = await this.prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!existingUser) {
      existingUser = await this.prisma.user.create({
        data: {
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          googleId: user.googleId,
        },
      });
    } else if (!existingUser.googleId) {
      existingUser = await this.prisma.user.update({
        where: { id: existingUser.id },
        data: { googleId: user.googleId },
      });
    }

    const accessToken = this.generateToken(existingUser);
    return { accessToken, user: existingUser };
  }

  generateToken(user: any): string {
    const payload = { email: user.email, sub: user.id };
    const secret = process.env.JWT_SECRET;
    console.log('AuthService: Signing token with secret:', {
      secretLength: secret?.length,
      isDefined: !!secret,
    });
    return this.jwtService.sign(payload);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        workspaceMemberships: {
          select: {
            workspace: {
              select: {
                id: true,
                name: true,
                description: true,
                slug: true,
                logo: true,
              },
            },
          },
        },
        workspaceOwnerships: {
          select: {
            id: true,
            name: true,
            description: true,
            slug: true,
            logo: true,
          },
        },
      },
    });

    if (
      user &&
      user.password &&
      (await bcrypt.compare(password, user.password))
    ) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async validateUserById(id: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        workspaceMemberships: {
          select: {
            workspace: {
              select: {
                id: true,
                name: true,
                description: true,
                slug: true,
                logo: true,
              },
            },
          },
        },
        workspaceOwnerships: {
          select: {
            id: true,
            name: true,
            description: true,
            slug: true,
            logo: true,
          },
        },
      },
    });

    return user;
  }

  async logLogin(userId: string, ipAddress: string, userAgent: string) {
    await this.prisma.loginLog.create({
      data: {
        userId,
        ipAddress,
        deviceId: userAgent,
      },
    });
  }

  async logout(token: string): Promise<void> {
    await this.sessionService.revokeSession(token);
  }

  async logoutAllDevices(userId: string): Promise<number> {
    return this.sessionService.revokeAllUserSessions(userId);
  }

  async revokeSession(sessionId: string, userId: string): Promise<void> {
    await this.sessionService.revokeSessionById(sessionId, userId);
  }

  async getUserSessions(userId: string) {
    return this.sessionService.getUserActiveSessions(userId);
  }

  async getUserLoginLogs(userId: string) {
    return this.prisma.loginLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}
