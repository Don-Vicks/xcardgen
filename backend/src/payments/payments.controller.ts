import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ConfirmCryptoPaymentDto,
  InitCryptoPaymentDto,
  PaymentsService,
} from './payments.service';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Get all available subscription plans
   */
  @Get('plans')
  async getPlans() {
    return this.paymentsService.getPlans();
  }

  /**
   * Get current user's subscription and usage
   */
  @Get('subscription')
  async getSubscription(@Request() req) {
    return this.paymentsService.getCurrentSubscription(req.user.id);
  }

  /**
   * Get payment history
   */
  @Get('history')
  async getPaymentHistory(@Request() req) {
    return this.paymentsService.getPaymentHistory(req.user.id);
  }

  /**
   * Initialize a crypto payment
   */
  @Post('crypto/init')
  async initCryptoPayment(@Request() req, @Body() dto: InitCryptoPaymentDto) {
    return this.paymentsService.initCryptoPayment(req.user.id, dto);
  }

  /**
   * Confirm a crypto payment after user sends funds
   */
  @Post('crypto/confirm')
  async confirmCryptoPayment(
    @Request() req,
    @Body() dto: ConfirmCryptoPaymentDto,
  ) {
    return this.paymentsService.confirmCryptoPayment(req.user.id, dto);
  }

  /**
   * Buy extra credits
   */
  @Post('credits/init')
  async buyCredits(@Request() req, @Body() dto: any) {
    return this.paymentsService.buyCredits(req.user.id, dto);
  }

  /**
   * Verify Solana Payment (Kit)
   */
  @Post('crypto/verify-solana')
  async verifySolana(
    @Request() req,
    @Body() body: { signature: string; planId?: string; credits?: number },
  ) {
    return this.paymentsService.verifyAndActivate(req.user.id, body);
  }

  /**
   * Confirm credit purchase
   */
  @Post('credits/confirm')
  async confirmCreditPurchase(
    @Request() req,
    @Body() dto: ConfirmCryptoPaymentDto,
  ) {
    return this.paymentsService.confirmCreditPurchase(req.user.id, dto);
  }
  /**
   * Admin: Manual Upgrade
   */
  @Post('admin/upgrade')
  async adminUpgrade(
    @Body()
    body: {
      userId: string;
      planId: string;
      interval?: 'MONTH' | 'YEAR';
    },
  ) {
    // In a real app, verify Admin Role or Secret Header here
    return this.paymentsService.adminUpgradeUser(
      body.userId,
      body.planId,
      body.interval,
    );
  }
}
