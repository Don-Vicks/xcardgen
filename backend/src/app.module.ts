import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { PrismaService } from './prisma.service';
import { TemplatesModule } from './templates/templates.module';
import { UsersModule } from './users/users.module';
import { XcardModule } from './xcard/xcard.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    XcardModule,
    AuthModule,
    EventsModule,
    TemplatesModule,
    CacheModule.register(),
    WorkspacesModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
