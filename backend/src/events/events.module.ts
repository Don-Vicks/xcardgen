import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule, CacheModule.register()],
  controllers: [EventsController],
  providers: [EventsService, PrismaService],
})
export class EventsModule {}
