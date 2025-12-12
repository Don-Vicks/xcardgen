import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { PrismaService } from '../prisma.service';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';

@Module({
  imports: [CloudinaryModule, CacheModule.register()],
  controllers: [TemplatesController],
  providers: [TemplatesService, PrismaService], // Providing service directly
  exports: [TemplatesService],
})
export class TemplatesModule {}
