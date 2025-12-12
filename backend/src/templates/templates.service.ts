import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Prisma } from 'generated/client';
import { PrismaService } from 'src/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class TemplatesService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
      ...(workspaceId ? { workspaceId } : { userId, workspaceId: null }), // Strict isolation
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

  async findOne(id: string, workspaceId?: string) {
    return this.prisma.template.findFirst({
      where: {
        id,
        ...(workspaceId ? { workspaceId } : { workspaceId: null }),
      },
    });
  }

  async update(id: string, data: Prisma.TemplateUpdateInput) {}

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
