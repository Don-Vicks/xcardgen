import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto, userId: string) {
    return this.prisma.event.create({
      data: {
        name: createEventDto.name,
        slug: createEventDto.slug,
        date: new Date(createEventDto.date),
        userId,
        description: createEventDto.description,
        coverImage: createEventDto.coverImage,
        // templateId will be null initially, handled by optional relation update
      },
    });
  }

  async findAll(userId: string) {
    const events = await this.prisma.event.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { cardGenerations: true },
        },
      },
    });

    // Map cardGenerations count to cards property for frontend compatibility
    return events.map((event) => ({
      ...event,
      _count: {
        cards: event._count.cardGenerations,
      },
    }));
  }

  async findOne(id: string, userId: string) {
    return this.prisma.event.findFirst({
      where: { id, userId },
    });
  }
}
