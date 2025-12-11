import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/client';
import { PrismaService } from 'src/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class TemplatesService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(data: Prisma.TemplateCreateInput) {
    return this.prisma.template.create({
      data,
    });
  }

  async findAll(
    userId: string,
    workspaceId?: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const page = Number(params?.page) || 1;
    const limit = Number(params?.limit) || 12;
    const skip = (page - 1) * limit;

    const where: Prisma.TemplateWhereInput = {
      userId,
      ...(workspaceId && { workspaceId }),
      ...(params?.search && {
        OR: [
          { name: { contains: params.search, mode: 'insensitive' } },
          { description: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.template.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [params?.sortBy || 'updatedAt']: params?.sortOrder || 'desc',
        },
      }),
      this.prisma.template.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
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

  async uploadAsset(file: Express.Multer.File) {
    return this.cloudinaryService.uploadImage(
      file.buffer ? file.buffer : file.path,
      'xcardgen_templates',
    );
  }
}
