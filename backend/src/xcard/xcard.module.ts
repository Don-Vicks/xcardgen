import { Module } from '@nestjs/common';
import { XcardService } from './xcard.service';
import { XcardController } from './xcard.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [XcardController],
  providers: [XcardService, PrismaService],
})
export class XcardModule {}
