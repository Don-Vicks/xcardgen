import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/client';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting generation count backfill...');

  // 1. Fetch all users
  const users = await prisma.user.findMany({
    select: { id: true, email: true },
  });

  console.log(`Found ${users.length} users.`);

  for (const user of users) {
    // 2. Count all card generations across all events owned by this user
    // We navigate User -> Event -> CardGeneration
    const generationCount = await prisma.cardGeneration.count({
      where: {
        event: {
          userId: user.id,
        },
      },
    });

    // 3. Update the user
    // NOTE: This overwrites the current count.
    // If the user had extra credits consumed, this simple count doesn't know that.
    // But since the consumption logic was just added, we assume all current generations are "monthly" or "total".
    // For now, we update generationCount (which effectively tracks "Usage during current period" usually).
    // However, since we don't have a reset date logic here, we are just setting it to TOTAL lifetime generations?
    // Wait, generationCount logic usually resets billing cycle.
    // If we set it to TOTAL, they might be over limit immediately.
    // BUT the user asked to "add Previous generations".
    // Assuming this is a one-time fix to sync reality with data.

    // Let's check if we should reset it or accumulate.
    // "add previous generations" -> implies we should count what they have done.

    if (generationCount > 0) {
      console.log(
        `Updating user ${user.email}: ${generationCount} generations`,
      );

      await prisma.user.update({
        where: { id: user.id },
        data: {
          generationCount: generationCount,
        },
      });
    }
  }

  console.log('Backfill complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
