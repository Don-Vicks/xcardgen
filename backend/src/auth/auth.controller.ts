import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const { accessToken } = await this.authService.loginGoogle(req.user);
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 60 minutes
    });
    res.redirect(`http://localhost:3000/callback`);
  }

  // ... register and login methods (already set cookies) ...

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    // Create user using users service
    const user = await this.usersService.create(registerDto);

    // Generate token using auth service
    const accessToken = this.authService.generateToken(user);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 60 minutes
    });

    return res.json({
      user,
      accessToken,
    });
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Extract the user's IP Address and device Id
    const forwarded = req.headers['x-forwarded-for'];
    const ipAddress =
      (typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : undefined) ||
      (req as any).connection?.remoteAddress ||
      (req as any).socket?.remoteAddress ||
      (req as any).info?.remoteAddress ||
      undefined;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const loginResult = await this.authService.login(loginDto, {
      ipAddress,
      userAgent,
    });

    if (loginResult && loginResult.accessToken) {
      res.cookie('access_token', loginResult.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 1000, // 60 minutes
      });
    }

    return res.json(loginResult);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify')
  async verifyToken(@CurrentUser() user: any) {
    return { valid: true, user };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    // Still allow extracting from header for valid logout logic if needed,
    // but mainly we want to clear cookie.
    const token =
      req.headers['authorization']?.replace('Bearer ', '') ||
      (req.cookies && req.cookies['access_token']);

    if (token) {
      await this.authService.logout(token);
    }

    res.clearCookie('access_token');
    return res.json({ message: 'Logged out successfully' });
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  async logoutAllDevices(@CurrentUser() user: any) {
    const count = await this.authService.logoutAllDevices(user.id);
    return {
      message: `Logged out from ${count} device(s)`,
      count,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async getSessions(@CurrentUser() user: any) {
    // You'll need to expose this method in AuthService
    return this.authService.getUserSessions(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  async revokeSession(@Param('id') id: string, @CurrentUser() user: any) {
    await this.authService.revokeSession(id, user.id);
    return { message: 'Session revoked' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('logs')
  async getLoginLogs(@CurrentUser() user: any) {
    return this.authService.getUserLoginLogs(user.id);
  }
}
