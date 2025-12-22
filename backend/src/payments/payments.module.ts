import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { PrismaService } from '../prisma.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { SubscriptionCronService } from './subscription-cron.service';

@Module({
  imports: [EmailModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PrismaService, SubscriptionCronService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
