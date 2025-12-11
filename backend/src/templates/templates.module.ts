import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';

@Module({
  controllers: [TemplatesController],
  providers: [TemplatesService, PrismaService], // Providing service directly
  exports: [TemplatesService],
})
export class TemplatesModule {}
