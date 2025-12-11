import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { Public } from 'src/auth/decorators/public.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createEventDto: CreateEventDto, @CurrentUser() user: User) {
    console.log('User ID', user.id);
    return this.eventsService.create(createEventDto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query('workspaceId') workspaceId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
  ) {
    return this.eventsService.findAll(user.id, {
      workspaceId,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
      search,
      sort,
    });
  }

  @Get(':id/analytics')
  getAnalytics(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.eventsService.getAnalytics(id, startDate, endDate);
  }

  @Public()
  @Get(':id/export/pdf')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="analytics-report.pdf"')
  async exportPdf(@Param('id') id: string) {
    return this.eventsService.generateReport(id, 'pdf');
  }

  @Get(':id/export/png')
  @Header('Content-Type', 'image/png')
  @Header('Content-Disposition', 'attachment; filename="analytics-report.png"')
  async exportPng(@Param('id') id: string) {
    return this.eventsService.generateReport(id, 'png');
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/export/analytics')
  async exportAnalytics(@Param('id') id: string, @Res() res: Response) {
    const csv = await this.eventsService.exportAnalytics(id);
    res.header('Content-Type', 'text/csv');
    res.header(
      'Content-Disposition',
      `attachment; filename="analytics_${id}.csv"`,
    );
    res.send(csv);
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.eventsService.findPublic(slug);
  }

  @Get(':id/export/attendees')
  async exportAttendees(@Param('id') id: string, @Res() res: any) {
    const csv = await this.eventsService.exportAttendees(id);
    res.header('Content-Type', 'text/csv');
    res.header(
      'Content-Disposition',
      `attachment; filename="attendees_${id}.csv"`,
    );
    res.send(csv);
  }

  @Post(':id/visit')
  async recordVisit(
    @Param('id') id: string,
    @Body() body: { visitorId?: string },
    @Req() req: any,
  ) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const referrer = req.headers['referer'];

    // Parse device/OS simplisticly from UA for now
    let device = 'Desktop';
    if (/mobile/i.test(userAgent)) device = 'Mobile';

    await this.eventsService.recordVisit(id, {
      visitorId: body.visitorId || ip, // Fallback to IP as visitorId if not provided
      ip: ip,
      userAgent: userAgent,
      referrer: referrer,
      device: device,
    });

    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  delete(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.eventsService.delete(id, user.id, workspaceId);
  }
}
