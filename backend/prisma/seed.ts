import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaClient, SubscriptionInterval } from '../generated/client';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Subscription Plans...');

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for side projects and hobbyists.',
      amount: 0.0,
      currency: 'USD',
      interval: SubscriptionInterval.MONTH,
      maxWorkspaces: 1,
      maxGenerations: 50,
      maxEvents: 3,
      maxMembers: 1,
      features: {
        canRemoveBranding: false,
        canUseCustomDomains: false,
        hasAdvancedAnalytics: false,
        hasPremiumAnalytics: false,
        canCustomizeTheme: false,
        canCustomizeAssets: false,
        hasFullCustomization: false,
        canCollectEmails: false,
        supportLevel: 'Community Support',
        leadGen: 'View Count Only',
        workspaceBranding: 'Default Layout',
        embedding: 'Included (Branded)',
      },
    },
    {
      name: 'Pro Monthly',
      description: 'For growing communities and events.',
      amount: 49.0,
      currency: 'USD',
      interval: SubscriptionInterval.MONTH,
      maxWorkspaces: 3,
      maxGenerations: 5000,
      maxEvents: -1,
      maxMembers: 5,
      features: {
        canRemoveBranding: true,
        canUseCustomDomains: false,
        hasAdvancedAnalytics: true,
        hasPremiumAnalytics: false,
        canCustomizeTheme: true,
        canCustomizeAssets: true,
        hasFullCustomization: false,
        canCollectEmails: true,
        supportLevel: 'Priority Email',
        leadGen: 'Collect Emails (CSV)',
        workspaceBranding: 'Custom Colors & Cover',
        embedding: 'White-label',
      },
    },
    {
      name: 'Pro Yearly',
      description: 'For growing communities and events. (2 Months Free)',
      amount: 490.0,
      currency: 'USD',
      interval: SubscriptionInterval.YEAR,
      maxWorkspaces: 3,
      maxGenerations: 60000, // Monthly limit x 12 effectively, or just keep same monthly throttle? Usually SaaS keeps monthly limit but billed yearly. Let's assume limit is per interval.
      // Actually schema says "maxGenerations", usually implies "per billing cycle".
      // If interval is YEAR, then maxGenerations should be 5000 * 12 = 60000?
      // Or does the system reset it every month?
      // The service: `await this.prisma.user.update({ ... generationCount: 0 })` in `activateSubscription`.
      // It sets `endDate` to 1 month from now.
      // Wait, `activateSubscription` hardcodes `endDate` to 1 month from now!
      // I need to fix `activateSubscription` to look at the plan interval!
      maxEvents: -1,
      maxMembers: 5,
      features: {
        canRemoveBranding: true,
        canUseCustomDomains: false,
        hasAdvancedAnalytics: true,
        hasPremiumAnalytics: false,
        canCustomizeTheme: true,
        canCustomizeAssets: true,
        hasFullCustomization: false,
        canCollectEmails: true,
        supportLevel: 'Priority Email',
        leadGen: 'Collect Emails (CSV)',
        workspaceBranding: 'Custom Colors & Cover',
        embedding: 'White-label',
      },
    },
    {
      name: 'Business Monthly',
      description: 'For large events and agencies.',
      amount: 199.0,
      currency: 'USD',
      interval: SubscriptionInterval.MONTH,
      maxWorkspaces: -1,
      maxGenerations: -1,
      maxEvents: -1,
      maxMembers: -1,
      features: {
        canRemoveBranding: true,
        canUseCustomDomains: true,
        hasAdvancedAnalytics: true,
        hasPremiumAnalytics: true,
        canCustomizeTheme: true,
        canCustomizeAssets: true,
        hasFullCustomization: true,
        canCollectEmails: true,
        supportLevel: 'Dedicated Slack',
        leadGen: 'Collect Emails (CSV)',
        workspaceBranding: 'Full Customization',
        embedding: 'White-label',
      },
    },
    {
      name: 'Business Yearly',
      description: 'For large events and agencies. (2 Months Free)',
      amount: 1990.0,
      currency: 'USD',
      interval: SubscriptionInterval.YEAR,
      maxWorkspaces: -1,
      maxGenerations: -1,
      maxEvents: -1,
      maxMembers: -1,
      features: {
        canRemoveBranding: true,
        canUseCustomDomains: true,
        hasAdvancedAnalytics: true,
        hasPremiumAnalytics: true,
        canCustomizeTheme: true,
        canCustomizeAssets: true,
        hasFullCustomization: true,
        canCollectEmails: true,
        supportLevel: 'Dedicated Slack',
        leadGen: 'Collect Emails (CSV)',
        workspaceBranding: 'Full Customization',
        embedding: 'White-label',
      },
    },
  ];

  // Rename legacy plans to avoid conflicts
  try {
    await prisma.subscriptionPlan.update({
      where: { name: 'Pro' },
      data: { name: 'Pro Monthly' },
    });
  } catch {}
  try {
    await prisma.subscriptionPlan.update({
      where: { name: 'Business' },
      data: { name: 'Business Monthly' },
    });
  } catch {}

  for (const plan of plans) {
    const existing = await prisma.subscriptionPlan.findUnique({
      where: { name: plan.name },
    });

    if (!existing) {
      await prisma.subscriptionPlan.create({
        data: plan,
      });
      console.log(`Created plan: ${plan.name}`);
    } else {
      await prisma.subscriptionPlan.update({
        where: { name: plan.name },
        data: plan,
      });
      console.log(`Updated plan: ${plan.name}`);
    }
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
