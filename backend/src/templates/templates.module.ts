import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';

import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [TemplatesController],
  providers: [TemplatesService, PrismaService], // Providing service directly
  exports: [TemplatesService],
})
export class TemplatesModule {}
