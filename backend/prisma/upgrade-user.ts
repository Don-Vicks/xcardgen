import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/client';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'donvicks004@gmail.com';
  const planName = 'Pro';

  console.log(`Upgrading ${email} to ${planName}...`);

  // 1. Find User
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error('User not found!');
    return;
  }

  // 2. Find Pro Plan
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { name: planName },
  });
  if (!plan) {
    console.error(`Plan ${planName} not found!`);
    return;
  }

  // 3. Deactivate existing active subscriptions
  await prisma.subscriptions.updateMany({
    where: { userId: user.id, status: 'ACTIVE' },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
  });

  // 4. Create new Subscription
  await prisma.subscriptions.create({
    data: {
      userId: user.id,
      subscriptionPlanId: plan.id,
      status: 'ACTIVE',
      startDate: new Date(),
    },
  });

  console.log(`Successfully upgraded ${email} to ${planName}.`);
  console.log(
    `New Limits: ${plan.maxGenerations} generations, ${plan.maxMembers} members.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
