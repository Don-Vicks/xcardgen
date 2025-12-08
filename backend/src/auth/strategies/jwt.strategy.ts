import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { SessionService } from '../session.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private sessionService: SessionService,
  ) {
    super({
      jwtFromRequest: (req) => {
        let token = null;
        if (req && req.cookies) {
          token = req.cookies['access_token'];
        }
        return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      },
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
      passReqToCallback: true, // Pass request to validate method
    });
  }

  async validate(req: any, payload: any) {
    // Extract token from Authorization header
    const token =
      req.headers.authorization?.replace('Bearer ', '') ||
      req.cookies?.access_token;

    console.log('JwtStrategy: Validating token...', { tokenFound: !!token });

    if (!token) {
      console.error('JwtStrategy: No token provided');
      throw new UnauthorizedException('No token provided');
    }

    // Check if session is active
    const session = await this.sessionService.findActiveSession(token);
    console.log('JwtStrategy: Session lookup result', {
      sessionFound: !!session,
    });

    if (!session) {
      console.error('JwtStrategy: Session expired or invalid');
      throw new UnauthorizedException('Session expired or invalid');
    }

    // Update session activity timestamp
    await this.sessionService.updateSessionActivity(token);

    // Validate user
    const user = await this.authService.validateUserById(payload.sub);
    console.log('JwtStrategy: User lookup result', {
      userFound: !!user,
      userId: payload.sub,
    });

    if (!user) {
      console.error('JwtStrategy: User not found');
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
