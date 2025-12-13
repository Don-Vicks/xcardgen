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
      maxGenerations: 100,
      maxEvents: 3,
      maxMembers: 1, // Only the owner (Solo)
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
      name: 'Pro',
      description: 'For growing communities and events.',
      amount: 29.0,
      currency: 'USD',
      interval: SubscriptionInterval.MONTH,
      maxWorkspaces: 3,
      maxGenerations: 5000,
      maxEvents: -1, // Unlimited
      maxMembers: 5,
      features: {
        canRemoveBranding: true,
        canUseCustomDomains: false, // Add-on required
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
      name: 'Business',
      description: 'For large events and agencies.',
      amount: 99.0,
      currency: 'USD',
      interval: SubscriptionInterval.MONTH,
      maxWorkspaces: -1, // Unlimited
      maxGenerations: -1, // Unlimited
      maxEvents: -1, // Unlimited
      maxMembers: -1, // Unlimited
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
