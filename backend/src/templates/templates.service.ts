import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.TemplateCreateInput) {
    return this.prisma.template.create({
      data,
    });
  }

  async findAll(userId: string, workspaceId?: string) {
    const where: Prisma.TemplateWhereInput = {
      userId,
    };
    if (workspaceId) {
      where.workspaceId = workspaceId;
    }
    return this.prisma.template.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.template.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.TemplateUpdateInput) {
    return this.prisma.template.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.template.delete({
      where: { id },
    });
  }
}
