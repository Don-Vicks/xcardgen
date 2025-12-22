import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailService } from '../email/email.service';
import { getEmailTemplate } from '../email/email.templates';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SubscriptionCronService {
  private readonly logger = new Logger(SubscriptionCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyReminders() {
    this.logger.log('Checking for expiring subscriptions...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1 Week Reminder (7 Days from today)
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);
    await this.sendReminders(sevenDaysFromNow, '1 Week');

    // 3 Days Reminder
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);
    await this.sendReminders(threeDaysFromNow, '3 Days');
  }

  private async sendReminders(targetDate: Date, timeFrame: string) {
    // Find subscriptions expiring on exactly targetDate (+24h window)
    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);

    const expiringSubscriptions = await this.prisma.subscriptions.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: targetDate,
          lt: nextDay,
        },
      },
      include: {
        user: { select: { email: true, name: true } },
      },
    });

    this.logger.log(
      `Found ${expiringSubscriptions.length} subscriptions expiring in ${timeFrame}`,
    );

    for (const sub of expiringSubscriptions) {
      if (sub.user?.email) {
        await this.emailService
          .sendEmail(
            sub.user.email,
            `Subscription Expiring Soon - ${timeFrame} Left`,
            getEmailTemplate(
              'Subscription Reminder',
              `<p>Hi ${sub.user.name || 'User'},</p><p>Your xCardGen subscription is set to expire in <strong>${timeFrame}</strong> on ${targetDate.toLocaleDateString()}.</p><p>To ensure uninterrupted access to premium features, please renew your subscription today.</p>`,
              `${process.env.FRONTEND_URL}/dashboard/billing`,
              'Renew Subscription',
            ),
          )
          .catch((err) =>
            this.logger.error(
              `Failed to send email to ${sub.user.email}`,
              err.stack,
            ),
          );
      }
    }
  }
}
