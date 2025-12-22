import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentStatus } from '../../generated/client';
import { EmailService } from '../email/email.service';
import { getEmailTemplate } from '../email/email.templates';
import { PrismaService } from '../prisma.service';

export interface InitCryptoPaymentDto {
  planId: string;
  currency: 'ETH' | 'SOL' | 'USDC';
}

export interface ConfirmCryptoPaymentDto {
  paymentId: string;
  txHash: string;
  walletAddress: string;
}

export interface BuyCreditsDto {
  amount: number;
  currency: 'ETH' | 'SOL' | 'USDC';
}

import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  private readonly PRICE_PER_GENERATION = 0.02; // $0.02 per generation

  // Crypto wallet addresses for receiving payments (would be in env in production)
  private readonly RECEIVING_WALLETS = {
    ETH: process.env.ETH_WALLET_ADDRESS || '0x...',
    SOL: process.env.SOL_WALLET_ADDRESS || '...',
    USDC: process.env.USDC_WALLET_ADDRESS || '0x...',
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  private isBillingEnabled(): boolean {
    return this.configService.get('ENABLE_BILLING') === 'true';
  }

  /**
   * Verify a Solana transaction signature on-chain
   */
  async verifySolanaPayment(userId: string, signature: string) {
    if (!this.isBillingEnabled()) {
      throw new BadRequestException('Billing disabled');
    }

    // Dynamic import to avoid build issues if package missing (though we installed it)
    const { Connection, PublicKey } = await import('@solana/web3.js');

    // Connect to Solana (Mainnet or Devnet based on Env)
    // Defaulting to Mainnet for production
    // Connect to Solana (Devnet requested by user)
    const rpcUrl =
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');

    let transaction;
    try {
      transaction = await connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
        commitment: 'confirmed',
      });
    } catch (error) {
      console.error('Solana verify error:', error);
      throw new BadRequestException(
        'Invalid signature or transaction not found',
      );
    }

    if (!transaction) {
      throw new BadRequestException('Transaction not found on chain');
    }

    if (transaction.meta?.err) {
      throw new BadRequestException('Transaction failed on-chain');
    }

    // Verify Recipient (Merchant Wallet)
    const merchantWallet = this.RECEIVING_WALLETS.SOL;

    // Strategy 1: Check Token Transfers (USDC/SPL)
    // In SPL transfers, the merchant's wallet is the 'owner' of the Token Account
    const merchantTokenBalance = transaction.meta?.postTokenBalances?.find(
      (b) => b.owner === merchantWallet, // Matches our wallet address
    );

    if (merchantTokenBalance) {
      // It's a token transfer! Verify amount.
      const accountIndex = merchantTokenBalance.accountIndex;
      const preToken = transaction.meta?.preTokenBalances?.find(
        (b) => b.accountIndex === accountIndex,
      );

      const preAmount = parseFloat(preToken?.uiTokenAmount?.amount || '0');
      const postAmount = parseFloat(
        merchantTokenBalance.uiTokenAmount?.amount || '0',
      );
      const tokenChange = postAmount - preAmount;

      console.log(
        `[VerifySolana] Token Payment Detected. Mint: ${merchantTokenBalance.mint}, Change: ${tokenChange}`,
      );

      if (tokenChange <= 0) {
        throw new BadRequestException(
          `No token funds received (Change: ${tokenChange})`,
        );
      }

      // Success for Token
      console.log(`[VerifySolana] Token Verification Successful`);
    } else {
      // Strategy 2: Check Native SOL Transfers
      // In SOL transfers, the merchant wallet is a direct account key
      const accountKeys = transaction.transaction.message.accountKeys;
      const merchantIndex = accountKeys.findIndex((key: any) => {
        const pubkey = key.pubkey ? key.pubkey.toString() : key.toString();
        return pubkey === merchantWallet;
      });

      if (merchantIndex === -1) {
        console.error(
          `[VerifySolana] Merchant ${merchantWallet} not found in keys or token owners.`,
        );
        throw new BadRequestException(
          'Transaction does not involve merchant wallet',
        );
      }

      // Check SOL Balance Change
      const preBalance = transaction.meta.preBalances[merchantIndex];
      const postBalance = transaction.meta.postBalances[merchantIndex];
      const balanceChange = postBalance - preBalance;

      console.log(
        `[VerifySolana] SOL Payment Detected. Change: ${balanceChange}`,
      );

      if (balanceChange <= 0) {
        throw new BadRequestException('No SOL funds received');
      }
    }

    // Idempotency: Check if signature already used
    const existing = await this.prisma.payment.findFirst({
      where: { txHash: signature },
    });
    if (existing) {
      throw new BadRequestException('Transaction already used');
    }

    return true;
  }

  /**
   * Finalize verification and activate
   */
  async verifyAndActivate(
    userId: string,
    body: { signature: string; planId?: string; credits?: number },
  ) {
    await this.verifySolanaPayment(userId, body.signature);

    // If verification passed:
    if (body.planId) {
      // Activate Plan
      // We need to fetch plan details to log the payment correctly
      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { id: body.planId },
      });
      if (!plan) throw new BadRequestException('Plan not found');

      await this.prisma.payment.create({
        data: {
          userId,
          amount: plan.amount, // stored as string
          currency: 'SOL_TX',
          provider: 'SOLANA_KIT',
          status: PaymentStatus.COMPLETED,
          txHash: body.signature,
          metadata: { planId: body.planId },
        },
      });
      await this.activateSubscription(userId, body.planId);
      return { success: true, message: 'Plan Upgraded' };
    }

    if (body.credits) {
      // Add Credits
      // Calculate implied price or just log it
      await this.prisma.creditPurchase.create({
        data: {
          userId,
          amount: body.credits,
          price: 0, // Unknown/Dynamic
          currency: 'SOL_TX',
          status: PaymentStatus.COMPLETED,
          txHash: body.signature,
        },
      });
      await this.prisma.user.update({
        where: { id: userId },
        data: { extraCredits: { increment: body.credits } },
      });
      return { success: true, message: 'Credits Added' };
    }

    throw new BadRequestException('No planId or credits specified');
  }

  /**
   * Initialize a crypto payment intent
   */
  async initCryptoPayment(userId: string, dto: InitCryptoPaymentDto) {
    if (!this.isBillingEnabled()) {
      throw new BadRequestException('Billing is currently disabled.');
    }

    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: dto.planId },
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    // Create a pending payment record
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount: plan.amount,
        currency: dto.currency,
        provider: `CRYPTO_${dto.currency}`,
        status: PaymentStatus.PENDING,
        metadata: {
          planId: dto.planId,
          planName: plan.name,
        },
      },
    });

    return {
      paymentId: payment.id,
      amount: plan.amount,
      currency: dto.currency,
      receivingAddress: this.RECEIVING_WALLETS[dto.currency],
      instructions: `Send ${plan.amount} ${dto.currency} to the address above. After sending, click "Confirm Payment" and enter your transaction hash.`,
    };
  }

  /**
   * Confirm a crypto payment (manual verification for MVP)
   * In production, this would verify the transaction on-chain
   */
  async confirmCryptoPayment(userId: string, dto: ConfirmCryptoPaymentDto) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id: dto.paymentId,
        userId,
        status: PaymentStatus.PENDING,
      },
    });

    if (!payment) {
      throw new Error('Payment not found or already processed');
    }

    // Update payment with tx details
    const updatedPayment = await this.prisma.payment.update({
      where: { id: dto.paymentId },
      data: {
        txHash: dto.txHash,
        walletAddress: dto.walletAddress,
        status: PaymentStatus.COMPLETED,
      },
    });

    // Activate subscription
    const metadata = payment.metadata as { planId: string };
    await this.activateSubscription(userId, metadata.planId);

    return {
      success: true,
      message: 'Payment confirmed and subscription activated',
      payment: updatedPayment,
    };
  }

  /**
   * Admin: Manually upgrade a user's subscription
   * Allows specifying a custom interval (overriding plan default if needed)
   */
  async adminUpgradeUser(
    userId: string,
    planId: string,
    intervalOverride?: 'MONTH' | 'YEAR',
  ) {
    return this.activateSubscription(userId, planId, intervalOverride);
  }

  /**
   * Activate or update user subscription
   */
  private async activateSubscription(
    userId: string,
    planId: string,
    intervalOverride?: 'MONTH' | 'YEAR',
  ) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) throw new Error('Plan not found during activation');

    const existingSubscription = await this.prisma.subscriptions.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    // Determine interval: use override if provided, else plan default
    const effectiveInterval = intervalOverride || plan.interval;

    const endDate = new Date();
    if (effectiveInterval === 'YEAR') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    if (existingSubscription) {
      // Extend or upgrade existing subscription
      await this.prisma.subscriptions.update({
        where: { id: existingSubscription.id },
        data: {
          subscriptionPlanId: planId,
          endDate,
        },
      });
    } else {
      // Create new subscription
      await this.prisma.subscriptions.create({
        data: {
          userId,
          subscriptionPlanId: planId,
          status: 'ACTIVE',
          endDate,
        },
      });
    }

    // Send Welcome Email
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { id: planId },
      });

      if (user?.email && plan) {
        this.emailService.sendEmail(
          user.email,
          `Welcome to xCardGen ${plan.name}`,
          getEmailTemplate(
            'Subscription Activated',
            `<p>Hi ${user.name || 'User'},</p><p>Thank you for subscribing to the <strong>${plan.name}</strong> plan.</p><p>You now have access to ${plan.maxGenerations} generations per month and all premium features.</p>`,
            `${process.env.FRONTEND_URL}/dashboard`,
            'Go to Dashboard',
          ),
        );
      }
    } catch (e) {
      console.error('Failed to send welcome email', e);
    }

    // Reset generation count for the new billing cycle
    await this.prisma.user.update({
      where: { id: userId },
      data: { generationCount: 0 },
    });

    return {
      success: true,
      message: `User moved to ${plan.name} (${effectiveInterval})`,
    };
  }

  /**
   * Get user's payment history
   */
  async getPaymentHistory(userId: string) {
    // Combine regular payments and credit purchases
    const [payments, creditPurchases] = await Promise.all([
      this.prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.creditPurchase.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Normalize and sort locally (simple implementation)
    return [...payments, ...creditPurchases].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  /**
   * Initiate purchase of extra credits
   */
  async buyCredits(userId: string, dto: BuyCreditsDto) {
    if (!this.isBillingEnabled()) {
      throw new BadRequestException('Billing is currently disabled.');
    }

    const priceUsd = dto.amount * this.PRICE_PER_GENERATION;

    // Create pending credit purchase
    const purchase = await this.prisma.creditPurchase.create({
      data: {
        userId,
        amount: dto.amount,
        price: priceUsd,
        currency: dto.currency,
        status: PaymentStatus.PENDING,
      },
    });

    return {
      paymentId: purchase.id,
      amount: priceUsd,
      credits: dto.amount,
      currency: dto.currency,
      receivingAddress: this.RECEIVING_WALLETS[dto.currency],
      instructions: `Send ${priceUsd} ${dto.currency} (approx) to the address above.`,
    };
  }

  /**
   * Confirm credit purchase
   */
  async confirmCreditPurchase(userId: string, dto: ConfirmCryptoPaymentDto) {
    const purchase = await this.prisma.creditPurchase.findFirst({
      where: {
        id: dto.paymentId,
        userId,
        status: PaymentStatus.PENDING,
      },
    });

    if (!purchase) {
      throw new Error('Purchase not found or already processed');
    }

    // Update purchase status
    const updatedPurchase = await this.prisma.creditPurchase.update({
      where: { id: dto.paymentId },
      data: {
        txHash: dto.txHash,
        status: PaymentStatus.COMPLETED,
      },
    });

    // Add credits to user
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        extraCredits: { increment: purchase.amount },
      },
    });

    return {
      success: true,
      message: `Successfully added ${purchase.amount} credits`,
      purchase: updatedPurchase,
    };
  }

  /**
   * Get user's current subscription
   */
  async getCurrentSubscription(userId: string) {
    let subscription = await this.prisma.subscriptions.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: { subscriptionPlan: true },
    });

    // Lazy Expiration Check
    if (subscription?.endDate) {
      console.log(
        `[Subscription Check] User: ${userId}, EndDate: ${subscription.endDate}, Now: ${new Date()}`,
      );
    }

    if (subscription?.endDate && new Date() > subscription.endDate) {
      console.log(
        `[Subscription] Expiring subscription ${subscription.id} for user ${userId}`,
      );

      // 1. Update status to EXPIRED
      await this.prisma.subscriptions.update({
        where: { id: subscription.id },
        data: { status: 'EXPIRED' },
      });

      // 2. Reset Generation Count
      await this.prisma.user.update({
        where: { id: userId },
        data: { generationCount: 0 },
      });

      // 3. Send Notification Email
      const userData = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });
      console.log(`[Subscription] User Email: ${userData?.email}`);
      if (userData?.email) {
        console.log('[Subscription] Attempting to send email...');
        // Fire and forget email (don't await to avoid blocking UI)
        this.emailService
          .sendEmail(
            userData.email,
            'Your xCardGen Subscription has Expired',
            getEmailTemplate(
              'Subscription Expired',
              '<p>Your premium subscription has ended. You have been moved to the Free tier.</p><p>To continue enjoying premium features and higher limits, please renew your subscription.</p>',
              `${process.env.FRONTEND_URL}/dashboard/billing`,
              'Renew Subscription',
            ),
          )
          .then(() => console.log('[Subscription] Email sent successfully'))
          .catch((e) => console.error('Failed to send expiration email', e));
      }

      // Treat as no active subscription
      subscription = null;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { generationCount: true, extraCredits: true },
    });

    return {
      subscription,
      usage: {
        generationsUsed: user?.generationCount || 0,
        // Since we explicitly added maxGenerations to SubscriptionPlan model, this is safe
        generationsLimit: subscription?.subscriptionPlan?.maxGenerations || 100,
        extraCredits: user?.extraCredits || 0,
      },
    };
  }

  /**
   * Get all available plans
   */
  async getPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { amount: 'asc' },
    });
  }

  /**
   * Check if a user has reached their usage limit for a resource.
   * Throws BadRequestException if limit reached.
   */
  async checkUsageLimit(
    userId: string,
    resource: 'workspaces' | 'events' | 'members',
    currentCount: number,
  ) {
    if (!this.isBillingEnabled()) {
      return true; // Bypass limits if billing disabled
    }

    const { subscription } = await this.getCurrentSubscription(userId);
    const plan = subscription?.subscriptionPlan;

    // Defaults if no plan (Free tier logic could be hardcoded here or in DB)
    // Assuming DB has a 'Free' plan logic or defaults if missing.
    // For now, if no plan is found we might want to be strict or lenient.
    // Let's assume strict: defaults to 0 or very low if no plan.
    // Actually, seed creates Starter plan. Subscription creation logic should ensure one exists.

    let limit = 0;
    if (resource === 'workspaces') limit = plan?.maxWorkspaces ?? 1;
    if (resource === 'events') limit = plan?.maxEvents ?? 1;
    if (resource === 'members') limit = plan?.maxMembers ?? 1;

    // -1 means unlimited
    if (limit === -1) return true;

    if (currentCount >= limit) {
      throw new BadRequestException(
        `You have reached the limit of ${limit} ${resource} for your current plan. Please upgrade to add more.`,
      );
    }
    return true;
  }

  /**
   * Check if a user has access to a specific feature.
   * Throws BadRequestException if denied.
   */
  async checkFeatureAccess(userId: string, feature: string) {
    if (!this.isBillingEnabled()) {
      return true; // Bypass feature gating if billing disabled
    }

    const { subscription } = await this.getCurrentSubscription(userId);
    const features = subscription?.subscriptionPlan?.features as Record<
      string,
      any
    >;

    if (!features || !features[feature]) {
      throw new BadRequestException(
        `Your current plan does not support ${feature}. Please upgrade to access this feature.`,
      );
    }
    return true;
  }

  /**
   * Check if a user has access to a specific feature (Boolean return).
   */
  async hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
    const { subscription } = await this.getCurrentSubscription(userId);
    const features = subscription?.subscriptionPlan?.features as Record<
      string,
      any
    >;
    return !!(features && features[feature]);
  }

  /**
   * Check and consume generation credits.
   * Checks monthly limit + extra credits.
   */
  async checkAndConsumeGeneration(userId: string) {
    // Increment generation count regardless of billing status (for usage tracking)
    if (!this.isBillingEnabled()) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { generationCount: { increment: 1 } },
      });
      return { source: 'unlimited' };
    }

    const { subscription, usage } = await this.getCurrentSubscription(userId);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new Error('User not found');

    const monthlyLimit = usage.generationsLimit;
    const used = usage.generationsUsed;
    const extra = user.extraCredits;

    console.log(
      `[Limits] User: ${userId}, Used: ${used}, Limit: ${monthlyLimit}, Extra: ${extra}`,
    );

    if (monthlyLimit !== -1 && used >= monthlyLimit) {
      // Monthly exhausted. Check extra.
      if (extra <= 0) {
        throw new BadRequestException(
          'You have run out of generation credits. Please upgrade or buy more credits.',
        );
      }
      // Consume extra
      await this.prisma.user.update({
        where: { id: userId },
        data: { extraCredits: { decrement: 1 } },
      });
      return { source: 'extra' };
    }

    // Consume monthly (via incrementing generationCount)
    await this.prisma.user.update({
      where: { id: userId },
      data: { generationCount: { increment: 1 } },
    });
    return { source: 'monthly' };
  }
}
