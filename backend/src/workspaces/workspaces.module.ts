import { Module } from '@nestjs/common';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { EmailModule } from 'src/email/email.module';
import { PrismaService } from 'src/prisma.service';
import { PaymentsModule } from '../payments/payments.module';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';

@Module({
  imports: [CloudinaryModule, EmailModule, PaymentsModule],
  controllers: [WorkspacesController],
  providers: [WorkspacesService, PrismaService],
})
export class WorkspacesModule {}
