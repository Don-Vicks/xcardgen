import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      console.warn(
        '⚠️ RESEND_API_KEY is missing. Email sending will be disabled.',
      );
    }
  }

  async sendEmail(to: string, subject: string, html: string) {
    if (!this.resend) {
      console.error('Cannot send email: RESEND_API_KEY is not configured.');
      return;
    }

    try {
      const data = await this.resend.emails.send({
        from: 'xCardGen <onboarding@resend.dev>',
        to,
        subject,
        html,
      });
      return data;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }
}
