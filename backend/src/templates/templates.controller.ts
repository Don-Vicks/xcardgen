import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Prisma } from 'generated/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TemplatesService } from './templates.service';

@Controller('templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  create(@Request() req, @Body() createTemplateDto: any) {
    const userId = req.user.id;
    const { workspaceId, ...rest } = createTemplateDto;

    return this.templatesService.create({
      ...rest,
      user: { connect: { id: userId } },
      workspace: workspaceId ? { connect: { id: workspaceId } } : undefined,
    });
  }

  @Get()
  findAll(@Request() req, @Query('workspaceId') workspaceId?: string) {
    return this.templatesService.findAll(req.user.userId, workspaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTemplateDto: Prisma.TemplateUpdateInput,
  ) {
    return this.templatesService.update(id, updateTemplateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }
}
