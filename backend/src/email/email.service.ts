import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'));
  }

  async sendEmail(to: string, subject: string, html: string) {
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
