import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/client';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
// @ts-ignore
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    include: {
      // @ts-ignore
      Subscriptions: {
        include: { subscriptionPlan: true },
      },
    },
  });

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  console.log('User Usage Debug:');
  console.log('--------------------------------------------------');
  console.log(
    'Name | Email | GenCount (DB) | Extra Credits | Total Gens | Plan',
  );
  console.log('--------------------------------------------------');

  for (const user of users) {
    // @ts-ignore
    const subs = user.Subscriptions;

    // Total Count
    const totalCount = await prisma.cardGeneration.count({
      where: { event: { userId: user.id } },
    });

    // @ts-ignore
    const planName = subs?.[0]?.subscriptionPlan?.name || 'No Plan';
    // @ts-ignore
    const activeSub = subs?.find((s) => s.status === 'ACTIVE');
    // @ts-ignore
    const displayPlan = activeSub
      ? activeSub.subscriptionPlan.name
      : `${planName} (Inactive)`;

    // @ts-ignore
    console.log(
      `${user.name} | ${user.email} | ${user.generationCount} | ${user.extraCredits} | ${totalCount} | ${displayPlan}`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
