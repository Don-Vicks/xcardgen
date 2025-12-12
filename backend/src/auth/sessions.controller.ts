import {
  Controller,
  Delete,
  Get,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth/sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  async getSessions(@Request() req) {
    return this.authService.getUserSessions(req.user.id);
  }

  @Delete()
  async revokeAllSessions(@Request() req) {
    return this.authService.logoutAllDevices(req.user.id);
  }

  @Delete(':id')
  async revokeSession(@Request() req, @Param('id') id: string) {
    return this.authService.revokeSession(id, req.user.id);
  }

  @Get('logs')
  async getLoginLogs(@Request() req) {
    return this.authService.getUserLoginLogs(req.user.id);
  }
}
