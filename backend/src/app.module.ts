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

@Module({
  imports: [
    UsersModule,
    XcardModule,
    AuthModule,
    EventsModule,
    TemplatesModule,
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register(),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
