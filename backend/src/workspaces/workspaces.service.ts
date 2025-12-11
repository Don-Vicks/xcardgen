import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new workspace for a user.
   * @param userId The ID of the user creating the workspace.
   * @param createWorkspace The data for the new workspace.
   * @returns The created workspace.
   */
  async create(userId: string, createWorkspace: CreateWorkspaceDto) {
    // const existingWorkspace = await this.prisma.workspace.findFirst({
    //   where: {
    //     ownerId: userId,
    //   },
    // });

    return await this.prisma.workspace.create({
      data: {
        ownerId: userId,
        slug: createWorkspace.slug,
        name: createWorkspace.name,
        logo: createWorkspace.logo,
        type: createWorkspace.type,
        description: createWorkspace.description,
        socialLinks: createWorkspace.socialLinks,
      },
    });
  }

  findAll() {
    return `This action returns all workspaces`;
  }

  /**
   * Finds a workspace by user ID.
   * @param userId The ID of the user.
   * @returns The workspace owned by the user.
   */
  async findOne(userId: string) {
    return await this.prisma.workspace.findFirst({
      where: {
        ownerId: userId,
      },
    });
  }

  /**
   * Updates a workspace owned by a user.
   * @param id The ID of the workspace to update.
   * @param userId The ID of the user updating the workspace.
   * @param updateWorkspaceDto The data for the updated workspace.
   * @returns The updated workspace.
   */
  async update(
    id: string,
    userId: string,
    updateWorkspaceDto: UpdateWorkspaceDto,
  ) {
    return await this.prisma.workspace.update({
      where: {
        id,
        ownerId: userId,
      },
      data: updateWorkspaceDto,
    });
  }

  /**
   * Deletes a workspace owned by a user.
   * @param id The ID of the workspace to delete.
   * @param userId The ID of the user deleting the workspace.
   * @returns The deleted workspace.
   */
  async remove(id: string, userId: string) {
    return await this.prisma.workspace.delete({
      where: {
        id,
        ownerId: userId,
      },
    });
  }

  async findPublic(slug: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { slug },
      include: {
        events: {
          where: {
            // status: 'PUBLISHED', // Assuming we only show published events, but Schema defaults to DRAFT.
            // For now, let's show all non-deleted events or stick to status if implemented.
            // Using deletedAt check as basic filter.
            deletedAt: null,
          },
          orderBy: { date: 'asc' },
          include: {
            stats: true,
          },
        },
        _count: {
          select: { templates: true, events: true },
        },
      },
    });

    if (!workspace) {
      throw new BadRequestException('Workspace not found');
    }

    return workspace;
  }

  async checkSlug(slug: string) {
    const existingWorkspace = await this.prisma.workspace.findUnique({
      where: {
        slug,
      },
    });

    if (existingWorkspace) {
      throw new BadRequestException('Workspace with this slug already exists');
    }
  }
}
