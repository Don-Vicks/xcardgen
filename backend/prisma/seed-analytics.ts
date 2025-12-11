import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/client';

dotenv.config();

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new Pool({ connectionString: process.env.DATABASE_URL }),
  ),
});

async function main() {
  const slug = 'solana-breakpoint-2025';

  console.log(`Finding event with slug: ${slug}...`);
  // Need to bypass Typescript strict check if needed or just use standard findUnique
  // Using explicit any cast if needed for client issues, but should be fine.
  const event = await prisma.event.findUnique({
    where: { slug: slug },
  });

  if (!event) {
    console.error(
      `Event with slug '${slug}' not found! Please create it first.`,
    );
    return;
  }

  const eventId = event.id;
  console.log(`Found event: ${event.name} (${eventId})`);
  console.log('Cleaning up old analytics data for this event...');

  try {
    // Optional: Cleanup old data for restart
    await prisma.eventVisit.deleteMany({ where: { eventId } });
    await prisma.nFTMint.deleteMany({ where: { attendee: { eventId } } });
    await prisma.cardGeneration.deleteMany({ where: { eventId } });
    await prisma.attendee.deleteMany({ where: { eventId } });

    console.log('Seeding data...');

    // 1. Seed Visits (Last 30 days)
    const devices = ['Mobile', 'Desktop', 'Tablet', 'Desktop', 'Mobile'];
    const referrers = [
      'https://twitter.com',
      'https://google.com',
      'Direct',
      'https://linkedin.com',
      'https://facebook.com',
    ];
    const countries = [
      'United States',
      'United Kingdom',
      'Nigeria',
      'Germany',
      'India',
      'Canada',
      'France',
    ];

    const visits: any[] = [];
    const totalVisits = 1500;

    for (let i = 0; i < totalVisits; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      // Add some randomness to time
      date.setHours(Math.floor(Math.random() * 24));

      visits.push({
        eventId,
        visitorId: `visitor_${Math.random().toString(36).substring(7)}`,
        device: devices[Math.floor(Math.random() * devices.length)],
        referrer: referrers[Math.floor(Math.random() * referrers.length)],
        country: countries[Math.floor(Math.random() * countries.length)],
        createdAt: date,
      });
    }

    await prisma.eventVisit.createMany({ data: visits });
    console.log(`Created ${visits.length} visits.`);

    // 2. Seed Attendees (Conversion Step 1)
    const totalAttendees = 820; // ~55% of visits
    const attendeesData: any[] = [];

    for (let i = 0; i < totalAttendees; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      attendeesData.push({
        eventId,
        name: `User ${Math.floor(Math.random() * 10000)}`,
        email: `user${i}@example.com`,
        createdAt: date,
      });
    }

    console.log(`Creating ${totalAttendees} attendees...`);
    // Use a loop for simplicity to get IDs
    const attendeeIds: string[] = [];
    for (const att of attendeesData) {
      const res = await prisma.attendee.create({ data: att });
      attendeeIds.push(res.id);
    }

    // 3. Seed Card Generations (Conversion Step 2)
    // ~80% of attendees generate a card
    const generationsCount = Math.floor(totalAttendees * 0.8);
    const generationData: any[] = [];

    for (let i = 0; i < generationsCount; i++) {
      const attendeeId = attendeeIds[i]; // roughly map 1-to-1 for first batch
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      generationData.push({
        eventId,
        attendeeId,
        imageUrl: 'https://via.placeholder.com/400x600',
        createdAt: date,
      });
    }

    await prisma.cardGeneration.createMany({ data: generationData });
    console.log(`Created ${generationsCount} card generations.`);

    // 4. Seed Downloads (Conversion Step 3)
    const downloadsCount = Math.floor(generationsCount * 0.6);

    // 5. Seed NFT Mints (Conversion Step 4)
    // ~40% of generations mint
    const mintsCount = Math.floor(generationsCount * 0.4);
    const mintData: any[] = [];

    for (let i = 0; i < mintsCount; i++) {
      const attendeeId = attendeeIds[i];
      const daysAgo = Math.floor(Math.random() * 20); // Mints are more recent usually
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      mintData.push({
        attendeeId,
        contractAddress: '0xSampleContractAddress',
        tokenId: `TOK-${i}`,
        status: 'MINTED',
        createdAt: date,
      });
    }

    await prisma.nFTMint.createMany({ data: mintData });
    console.log(`Created ${mintsCount} NFT mints.`);

    // 6. Update Event Stats
    console.log('Updating Event Stats...');
    await prisma.eventStats.upsert({
      where: { eventId },
      create: {
        eventId,
        views: totalVisits,
        uniques: Math.floor(totalVisits * 0.7),
        generations: generationsCount,
        attendees: totalAttendees,
        downloads: downloadsCount,
        shares: Math.floor(downloadsCount * 0.2),
      },
      update: {
        views: totalVisits,
        uniques: Math.floor(totalVisits * 0.7),
        generations: generationsCount,
        attendees: totalAttendees,
        downloads: downloadsCount,
        shares: Math.floor(downloadsCount * 0.2),
      },
    });

    console.log('Seeding complete! 🚀');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
