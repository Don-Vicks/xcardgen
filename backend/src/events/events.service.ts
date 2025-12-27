import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as puppeteer from 'puppeteer';
import { PrismaService } from 'src/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { generateTicketHtml } from './ticket-generator.util';

import { PaymentsService } from 'src/payments/payments.service';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private paymentsService: PaymentsService,
  ) {}

  async create(createEventDto: CreateEventDto, userId: string) {
    return this.prisma.event.create({
      data: {
        name: createEventDto.name,
        slug: createEventDto.slug,
        date: new Date(createEventDto.date),
        endDate: createEventDto.endDate
          ? new Date(createEventDto.endDate)
          : null,
        userId,
        workspaceId: createEventDto.workspaceId,
        description: createEventDto.description,
        coverImage: createEventDto.coverImage,
        stats: {
          create: {},
        },
        // templateId will be null initially, handled by optional relation update
      },
    });
  }

  async findAll(
    userId: string,
    options: {
      workspaceId?: string;
      page?: number;
      limit?: number;
      search?: string;
      sort?: string;
    },
  ) {
    const { workspaceId, page = 1, limit = 50, search, sort } = options;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      userId,
      deletedAt: null,
      ...(workspaceId ? { workspaceId } : { workspaceId: null }), // Strict: If no workspaceId, assume Personal (null)
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    if (sort === 'alphabetical') orderBy = { name: 'asc' };

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limit,
        include: {
          stats: true,
          template: true,
        },
      }),
      this.prisma.event.count({ where: whereClause }),
    ]);

    return {
      data: events.map((event) => ({
        ...event,
        _count: {
          cards: event.stats?.generations || 0,
        },
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPublic(slugOrId: string) {
    const cacheKey = `public_event_${slugOrId}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as any;
    }

    const event = await this.prisma.event.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { id: slugOrId }],
        deletedAt: null, // Explicitly ensure not deleted
      },
      include: {
        stats: true,
        template: true,
        workspace: true,
        _count: {
          select: { attendees: true },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check Branding Feature
    const canRemoveBranding = await this.paymentsService
      .hasFeatureAccess(event.userId, 'canRemoveBranding')
      .catch(() => false);

    // User must have the feature AND have enabled the toggle in appearance settings
    const userWantsToRemoveBranding =
      (event as any).appearance?.removeBranding === true;
    const shouldShowBranding = !(
      canRemoveBranding && userWantsToRemoveBranding
    );

    // Cache the COMPUTED result with showBranding included
    const result = { ...event, showBranding: shouldShowBranding };
    await this.cacheManager.set(cacheKey, result, 3600000);
    return result;
  }

  async findOne(idOrSlug: string, userId: string, workspaceId?: string) {
    return this.prisma.event.findFirst({
      where: {
        AND: [
          { userId },
          {
            OR: [{ id: idOrSlug }, { slug: idOrSlug }],
          },
          workspaceId ? { workspaceId } : { workspaceId: null },
        ],
      },
      include: {
        stats: true,
        template: true,
      },
    });
  }

  async findOnePublic(idOrSlug: string) {
    return this.prisma.event.findFirst({
      where: {
        AND: [
          {
            OR: [{ id: idOrSlug }, { slug: idOrSlug }],
          },
        ],
      },
      include: {
        stats: true,
        template: true,
      },
    });
  }

  async update(id: string, userId: string, data: any) {
    // 1. Update
    // Check Limit if publishing
    if (data.status === 'PUBLISHED') {
      const currentPublished = await this.prisma.event.count({
        where: { userId, status: 'PUBLISHED', deletedAt: null },
      });
      // Only check if we are actually changing status to PUBLISHED (optimization: check if it was already published?)
      // For simplicity, just check limit. Valid even if already published (limit >= current).
      // But strictly: if current=1, limit=1. I am 1. Updating me shouldn't fail.
      // So we should exclude THIS event from count, or check if it was ALREADY published.

      const existing = await this.prisma.event.findUnique({
        where: { id },
        select: { status: true },
      });
      if (existing && existing.status !== 'PUBLISHED') {
        // We are switching from DRAFT -> PUBLISHED. Check limit.
        await this.paymentsService.checkUsageLimit(
          userId,
          'events',
          currentPublished,
        );
      }
    }

    const updated = await this.prisma.event.update({
      where: { id, userId },
      data,
    });

    // 2. Invalidate Cache
    // We invalidate both ID and Slug keys.
    // Note: If slug *changed*, ideally we invalidate the old one too, but for now we invalidate the current one.
    // Since `updated` has the current (possibly new) slug, we invalidate that.
    await (this.cacheManager as any).del(`public_event_${id}`);
    if (updated.slug) {
      await (this.cacheManager as any).del(`public_event_${updated.slug}`);
    }

    return updated;
  }

  async delete(id: string, userId: string, workspaceId: string) {
    // 1. Soft delete
    const deleted = await this.prisma.event.update({
      where: { id, userId, workspaceId },
      data: { deletedAt: new Date(), status: 'DRAFT' },
    });

    // 2. Invalidate Cache
    await (this.cacheManager as any).del(`public_event_${id}`);
    if (deleted.slug) {
      await (this.cacheManager as any).del(`public_event_${deleted.slug}`);
    }

    return deleted;
  }

  async recordVisit(
    eventId: string,
    data: {
      visitorId?: string;
      referrer?: string;
      userAgent?: string;
      ip?: string;
      country?: string;
      city?: string;
      device?: string;
    },
  ) {
    // 1. Create Visit Log
    await this.prisma.eventVisit.create({
      data: {
        eventId,
        visitorId: data.visitorId,
        referrer: data.referrer,
        userAgent: data.userAgent,
        country: data.country,
        city: data.city,
        device: data.device,
      },
    });

    // 2. Update Aggregated Stats
    // Check if unique visitor
    let isUnique = false;
    if (data.visitorId) {
      const existingVisit = await this.prisma.eventVisit.findFirst({
        where: {
          eventId,
          visitorId: data.visitorId,
          NOT: { id: { equals: 'just-created' } },
        }, // Logic usually requires checking BEFORE creating.
      });
      // Actually, simple check: count visits by this visitorId. If 1 (the one we just made), it's unique.
      // Better: check if previous visit exists before creating.
    }

    // Simplification for speed: Just increment views. Uniques require better tracking logic (e.g. separate check).
    // Let's assume passed visitorId is consistent.
    const previousVisits = data.visitorId
      ? await this.prisma.eventVisit.count({
          where: { eventId, visitorId: data.visitorId },
        })
      : 0;

    const isNewVisitor = previousVisits === 1; // It's 1 because we just created it? No, I created it above. So if count is 1, it's the first time.

    await this.prisma.eventStats.upsert({
      where: { eventId },
      create: {
        eventId,
        views: 1,
        uniques: isNewVisitor ? 1 : 0,
      },
      update: {
        views: { increment: 1 },
        uniques: { increment: isNewVisitor ? 1 : 0 },
      },
    });
  }

  async getAnalytics(eventId: string, startDate?: string, endDate?: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        stats: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Determine Date Range
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date();
    if (!startDate) {
      start.setDate(end.getDate() - 30); // Default to 30 days ago
    }

    const visits = await this.prisma.eventVisit.findMany({
      where: {
        eventId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: { createdAt: true, device: true, referrer: true, country: true },
    });

    // Aggregate Visits Over Time
    const visitsMap = new Map<string, number>();
    visits.forEach((v) => {
      const date = v.createdAt.toISOString().split('T')[0];
      visitsMap.set(date, (visitsMap.get(date) || 0) + 1);
    });

    const visitsOverTime = Array.from(visitsMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Aggregate Countries
    const countryMap = new Map<string, number>();
    visits.forEach((v) => {
      const country = v.country || 'Unknown';
      countryMap.set(country, (countryMap.get(country) || 0) + 1);
    });
    const countryBreakdown = Array.from(countryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5

    // Aggregate Devices
    const deviceMap = new Map<string, number>();
    visits.forEach((v) => {
      const dev = v.device || 'Unknown';
      deviceMap.set(dev, (deviceMap.get(dev) || 0) + 1);
    });
    const deviceBreakdown = Array.from(deviceMap.entries()).map(
      ([name, value]) => ({ name, value }),
    );

    // Aggregate Referrers (Traffic Sources)
    const referrerMap = new Map<string, number>();
    visits.forEach((v) => {
      let ref = v.referrer || 'Direct';
      try {
        if (ref !== 'Direct') {
          const url = new URL(ref);
          ref = url.hostname.replace('www.', '');
        }
      } catch (e) {} // Fallback to raw string if invalid URL
      referrerMap.set(ref, (referrerMap.get(ref) || 0) + 1);
    });
    const trafficSources = Array.from(referrerMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Premium: Peak Activity (UTC hours)
    const peakActivity = new Array(24)
      .fill(0)
      .map((_, i) => ({ hour: i, count: 0 }));
    visits.forEach((v) => {
      const hour = v.createdAt.getHours();
      peakActivity[hour].count++;
    });

    // Premium: Top Domains (Audience Quality)
    const attendees = await this.prisma.attendee.findMany({
      where: { eventId },
      select: { email: true },
    });
    const domainMap = new Map<string, number>();
    const genericDomains = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
      'icloud.com',
      'aol.com',
      'protonmail.com',
    ];
    attendees.forEach((a) => {
      if (!a.email) return;
      const domain = a.email.split('@')[1];
      if (domain && !genericDomains.includes(domain.toLowerCase())) {
        domainMap.set(domain, (domainMap.get(domain) || 0) + 1);
      }
    });

    const topDomains = Array.from(domainMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Premium: Growth Trends
    const duration = end.getTime() - start.getTime();
    const prevEnd = new Date(start.getTime());
    const prevStart = new Date(prevEnd.getTime() - duration);

    const currentGenerationsCount = await this.prisma.cardGeneration.count({
      where: { eventId, createdAt: { gte: start, lte: end } },
    });

    const [prevVisits, prevGenerations] = await Promise.all([
      this.prisma.eventVisit.count({
        where: { eventId, createdAt: { gte: prevStart, lte: prevEnd } },
      }),
      this.prisma.cardGeneration.count({
        where: { eventId, createdAt: { gte: prevStart, lte: prevEnd } },
      }),
    ]);

    const trends = {
      views: this.calculateTrend(visits.length, prevVisits),
      generations: this.calculateTrend(
        currentGenerationsCount,
        prevGenerations,
      ),
    };

    // Fetch Recent Activity (Generations & Mints)
    const [recentGenerations, recentMints] = await Promise.all([
      this.prisma.cardGeneration.findMany({
        where: { eventId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { attendee: true },
      }),
      this.prisma.nFTMint.findMany({
        where: { attendee: { eventId } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { attendee: true },
      }),
    ]);

    const recentActivity = [
      ...recentGenerations.map((g) => ({
        type: 'GENERATION',
        description: `${g.attendee?.name || 'Visitor'} generated a xCard`,
        createdAt: g.createdAt,
      })),
      ...recentMints.map((m) => ({
        type: 'MINT',
        description: `${m.attendee?.name || 'Attendee'} minted an xCard NFT`,
        createdAt: m.createdAt,
      })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);

    // Fetch NFT Mint Stats
    const nftMints = await this.prisma.nFTMint.count({
      where: {
        attendee: { eventId },
        status: 'MINTED',
      },
    });

    // Verify Plan Features for Gating
    const hasAdvancedAnalytics = await this.paymentsService.hasFeatureAccess(
      event.userId,
      'hasAdvancedAnalytics',
    );
    const hasPremiumAnalytics = await this.paymentsService.hasFeatureAccess(
      event.userId,
      'hasPremiumAnalytics',
    );

    return {
      event,
      stats: {
        ...(event?.stats || {
          views: 0,
          uniques: 0,
          generations: 0,
          attendees: 0,
          downloads: 0,
          shares: 0,
        }),
        nftMints,
      },
      visitsOverTime, // Basic
      // Advanced
      deviceBreakdown: hasAdvancedAnalytics ? deviceBreakdown : [],
      countryBreakdown: hasAdvancedAnalytics ? countryBreakdown : [],
      trafficSources: hasAdvancedAnalytics ? trafficSources : [],
      // Premium
      recentActivity: recentActivity, // Allowed? Maybe advanced. Let's keep for now or gate.
      peakActivity: hasPremiumAnalytics ? peakActivity : [],
      topDomains: hasPremiumAnalytics ? topDomains : [],
      trends: hasPremiumAnalytics ? trends : null,
    };
  }

  private calculateTrend(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }
  async generateReport(
    eventId: string,
    format: 'pdf' | 'png',
  ): Promise<StreamableFile> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException('Event not found');

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process',
        '--no-zygote',
      ],
    });

    try {
      const page = await browser.newPage();

      // Set viewport to match our report design
      await page.setViewport({
        width: 1200,
        height: 1600,
        deviceScaleFactor: 2,
      });

      // Fetch full analytics data to inject
      const analyticsData = await this.getAnalytics(eventId);

      // Inject data BEFORE navigation so it's available immediately
      await page.evaluateOnNewDocument((data) => {
        (window as any).__INITIAL_DATA__ = data;
      }, analyticsData);

      // Navigate to the report page
      // Using localhost for now - in prod this should be an ENV var
      const reportUrl = `${process.env.FRONTEND_URL}/report/${event.slug}`;
      console.log(`Generating ${format.toUpperCase()} from: ${reportUrl}`);

      await page.goto(reportUrl, {
        waitUntil: 'networkidle0', // Wait for likely hydration
        timeout: 30000,
      });

      // Ensure the content is actually there
      await page.waitForSelector('#report-content', { timeout: 5000 });

      let buffer: Uint8Array;

      if (format === 'pdf') {
        buffer = await page.pdf({
          printBackground: true,
          width: '1200px',
          height: '1850px',
        });
      } else {
        buffer = await page.screenshot({
          type: 'png',
          fullPage: true, // Capture entire scrollable area (which is fixed to 1600px anyway)
        });
      }

      await browser.close();

      return new StreamableFile(buffer, {
        type: format === 'pdf' ? 'application/pdf' : 'image/png',
        disposition: `attachment; filename="analytics-report.${format}"`,
      });
    } catch (error) {
      console.error('Report generation error:', error);
      await browser.close();
      throw new BadRequestException(`Failed to generate ${format} report`);
    }
  }

  /**
   * Export analytics for an event
   * @param eventId
   * @returns CSV string
   */
  async exportAnalytics(eventId: string) {
    const data = await this.getAnalytics(eventId);
    const { stats, countryBreakdown, trafficSources } = data;

    // Create subtle summary CSV
    const rows = [
      ['Metric', 'Value'],
      ['Total Visits', stats.views],
      ['Unique Visitors', stats.uniques],
      ['Attendees', stats.attendees],
      ['Card Generations', stats.generations],
      ['Downloads', stats.downloads],
      ['NFT Mints', stats.nftMints],
      [],
      ['Top Countries', 'Visits'],
      // @ts-ignore
      ...countryBreakdown.map((c) => [c.name, c.value]),
      [],
      ['Top Referrers', 'Visits'],
      // @ts-ignore
      ...trafficSources.map((s) => [s.name, s.value]),
    ];

    return rows.map((r) => r.join(',')).join('\n');
  }

  /**
   * Export attendees for an event
   * @param eventId
   * @returns CSV string
   */
  async exportAttendees(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { userId: true },
    });
    if (!event) throw new NotFoundException('Event not found');

    // Gate Lead Gen Feature (Exporting Data)
    await this.paymentsService.checkFeatureAccess(
      event.userId,
      'canCollectEmails',
    );

    const attendees = await this.prisma.attendee.findMany({
      where: { eventId },
      include: {
        cardGenerations: true,
        nftMints: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const rows = [
      ['Name', 'Email', 'Joined At', 'Cards Generated', 'NFTs Minted'],
      ...attendees.map((a) => [
        `"${a.name}"`,
        a.email,
        a.createdAt.toISOString().split('T')[0],
        a.cardGenerations.length,
        a.nftMints.length,
      ]),
    ];

    return rows.map((r) => r.join(',')).join('\n');
  }

  async registerAttendee(
    id: string,
    body: { name: string; email: string; data: Record<string, any> },
  ) {
    const event = await this.findPublic(id);
    if (!event.template) {
      throw new BadRequestException('Event does not have a template');
    }

    // Check & Consume Generation Credit (Logic handles monthly vs extra)
    // Only consume if we are actually generating a NEW card.
    // But we don't know if it's new yet until we look up attendee/generation.
    // However, if we do it late, we might generate the image for nothing.
    // BETTER: Check balance first (peek). Then consume later?
    // OR: Just check existing generation first.

    // Check if generation exists for this attendee to prevent duplicates (and free generations)
    // We need to resolve attendee first.
    let existingAttendee = await this.prisma.attendee.findUnique({
      where: { eventId_email: { eventId: event.id, email: body.email } },
    });

    let isNewGeneration = true;
    if (existingAttendee) {
      const existingGen = await this.prisma.cardGeneration.findFirst({
        where: { eventId: event.id, attendeeId: existingAttendee.id },
      });
      if (existingGen) isNewGeneration = false;
    }

    // If new, consume credit
    if (isNewGeneration) {
      await this.paymentsService.checkAndConsumeGeneration(event.userId);
    }

    // Check Feature Access (Remove Branding)
    // Feature key: 'canRemoveBranding' (as defined in seed/schema plan)
    const canRemoveBranding = await this.paymentsService.hasFeatureAccess(
      event.userId,
      'canRemoveBranding',
    );

    // Generate HTML
    const html = generateTicketHtml(
      event.template,
      {
        ...body.data,
        name: body.name,
        email: body.email,
      },
      { removeBranding: canRemoveBranding },
    );

    // Generate Image via Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process',
        '--no-zygote',
      ],
    });
    const page = await browser.newPage();
    const width = (event.template.properties as any)?.width || 600;
    const height = (event.template.properties as any)?.height || 400;

    await page.setViewport({ width, height });
    await page.setContent(html);

    // Wait for images/fonts
    await page.evaluateHandle('document.fonts.ready');

    const buffer = await page.screenshot({ type: 'png', omitBackground: true });
    await browser.close();

    // Upload to Cloudinary
    const uploadRes = await this.cloudinaryService.uploadImage(
      buffer as Buffer,
      'xcardgen_tickets',
    );
    const imageUrl = uploadRes.secure_url;

    // Save Attendee & Generation
    const attendee = await this.prisma.attendee.upsert({
      where: {
        eventId_email: {
          eventId: event.id,
          email: body.email,
        },
      },
      update: {
        name: body.name,
        data: body.data,
      },
      create: {
        eventId: event.id,
        email: body.email,
        name: body.name,
        data: body.data,
      },
    });

    // Check if generation exists for this attendee to prevent duplicates
    const existingGen = await this.prisma.cardGeneration.findFirst({
      where: {
        eventId: event.id,
        attendeeId: attendee.id,
      },
      orderBy: { createdAt: 'desc' }, // Get latest
    });

    let generationId = existingGen?.id;
    console.log(
      `[Register] Email: ${body.email}, ExistingGen: ${!!existingGen}`,
    );

    // Always consume credit for every generation attempt
    console.log(`[Register] New generation request. Consuming credit...`);
    await this.paymentsService.checkAndConsumeGeneration(event.userId);

    const newGen = await this.prisma.cardGeneration.create({
      data: {
        eventId: event.id,
        attendeeId: attendee.id,
        imageUrl: imageUrl,
      },
    });
    generationId = newGen.id;

    // Update Stats
    await this.prisma.eventStats.upsert({
      where: {
        eventId: event.id,
      },
      update: {
        generations: {
          increment: 1,
        },
        // Only increment unique attendees count if this person didn't exist before
        attendees: {
          increment: existingAttendee ? 0 : 1,
        },
      },
      create: {
        eventId: event.id,
        generations: 1,
        downloads: 0,
        attendees: 1,
      },
    });

    return { url: imageUrl };
  }

  async recordDownload(id: string, cardGenerationId?: string) {
    // 1. Increment aggregate
    await this.prisma.eventStats.upsert({
      where: { eventId: id },
      update: {
        downloads: { increment: 1 },
      },
      create: {
        eventId: id,
        downloads: 1,
      },
    });

    // 2. Detailed Tracking
    if (cardGenerationId) {
      // Verify existence to prevent foreign key errors
      const gen = await this.prisma.cardGeneration.findUnique({
        where: { id: cardGenerationId },
      });
      if (gen) {
        await this.prisma.download.create({
          data: {
            eventId: id,
            cardGenerationId,
          },
        });
      }
    }
  }

  async recordShare(id: string, platform?: string, cardGenerationId?: string) {
    // 1. Increment aggregate
    await this.prisma.eventStats.upsert({
      where: { eventId: id },
      update: {
        shares: { increment: 1 },
      },
      create: {
        eventId: id,
        shares: 1,
        generations: 0,
        downloads: 0,
        attendees: 0,
      },
    });

    // 2. Detailed Tracking
    if (cardGenerationId && platform) {
      const gen = await this.prisma.cardGeneration.findUnique({
        where: { id: cardGenerationId },
      });
      if (gen) {
        await this.prisma.socialShare.create({
          data: {
            cardGenerationId,
            platform,
          },
        });
      }
    }
  }

  async uploadAsset(eventId: string, file: Express.Multer.File) {
    // Check Limits BEFORE uploading to save storage
    // We need to find the event owner first
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { userId: true },
    });

    if (!event) throw new NotFoundException('Event not found');

    // Check if user has credits (Peeking without consuming)
    // We reuse checkAndConsumeGeneration but we need a 'peek' method ideally.
    // Or just check manually here.
    const { usage } = await this.paymentsService.getCurrentSubscription(
      event.userId,
    );
    const available =
      usage.generationsLimit === -1 ||
      usage.generationsUsed < usage.generationsLimit ||
      usage.extraCredits > 0;

    if (!available) {
      throw new BadRequestException(
        'Event organizer has reached their generation limit. Cannot upload assets.',
      );
    }

    return this.cloudinaryService.uploadImage(
      file.buffer ? file.buffer : file.path,
      'xcardgen_assets',
    );
  }
  async getDashboardStats(userId: string, workspaceId: string) {
    try {
      // 1. Get all events for user
      const events = await this.prisma.event.findMany({
        where: { userId, deletedAt: null, workspaceId },
        include: {
          stats: true,
        },
      });
      const eventIds = events.map((e) => e.id);

      // 2. Global Aggregates
      const stats = events.reduce(
        (acc, event) => ({
          views: acc.views + (event.stats?.views || 0),
          generations: acc.generations + (event.stats?.generations || 0),
          attendees: acc.attendees + (event.stats?.attendees || 0),
        }),
        { views: 0, generations: 0, attendees: 0 },
      );

      // 3. Activity Over Time (Last 30 Days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [visits, generations] = await Promise.all([
        this.prisma.eventVisit.findMany({
          where: {
            eventId: { in: eventIds },
            createdAt: { gte: thirtyDaysAgo },
          },
          select: { createdAt: true },
        }),
        this.prisma.cardGeneration.findMany({
          where: {
            eventId: { in: eventIds },
            createdAt: { gte: thirtyDaysAgo },
          },
          select: { createdAt: true },
        }),
      ]);

      // Group by Date
      const timelineMap = new Map<
        string,
        { date: string; views: number; generations: number }
      >();

      // Initialize map for last 30 days to ensure continuous line
      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        timelineMap.set(dateStr, { date: dateStr, views: 0, generations: 0 });
      }

      visits.forEach((v) => {
        const date = v.createdAt.toISOString().split('T')[0];
        if (timelineMap.has(date)) {
          timelineMap.get(date)!.views++;
        }
      });

      generations.forEach((g) => {
        const date = g.createdAt.toISOString().split('T')[0];
        if (timelineMap.has(date)) {
          timelineMap.get(date)!.generations++;
        }
      });

      const activityTrend = Array.from(timelineMap.values()).sort((a, b) =>
        a.date.localeCompare(b.date),
      );

      // 4. Global Recent Activity (Feed)
      // Fetch latest 10 generations across ALL events
      const recentActivity = await this.prisma.cardGeneration.findMany({
        where: { eventId: { in: eventIds } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          attendee: true,
          event: { select: { name: true, slug: true } },
        },
      });

      const feed = recentActivity.map((r) => ({
        id: r.id,
        type: 'GENERATION',
        user: r.attendee?.name || 'Visitor',
        event: r.event?.name,
        timestamp: r.createdAt,
        details: `generated a xCard`,
        avatar:
          (r.attendee?.data as any)?.avatar ||
          `https://avatar.vercel.sh/${r.attendee?.id || 'guest'}`,
      }));

      // 5. Global Audience (Countries & Devices) purely from Visits
      const allVisits = await this.prisma.eventVisit.findMany({
        where: { eventId: { in: eventIds } },
        select: { country: true, device: true },
        take: 5000, // Limit sample size for performance if needed
      });

      const countryMap = new Map<string, number>();
      const deviceMap = new Map<string, number>();

      allVisits.forEach((v) => {
        const c = v.country || 'Unknown';
        countryMap.set(c, (countryMap.get(c) || 0) + 1);
        const d = v.device || 'Unknown';
        deviceMap.set(d, (deviceMap.get(d) || 0) + 1);
      });

      const topCountries = Array.from(countryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      const devices = Array.from(deviceMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      return {
        stats,
        activityTrend,
        feed,
        audience: {
          countries: topCountries,
          devices,
        },
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
}
