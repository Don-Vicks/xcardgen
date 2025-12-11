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
  async findOne(userId: string, workspaceId: string) {
    return await this.prisma.workspace.findFirst({
      where: {
        ownerId: userId,
        id: workspaceId,
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
    workspaceId: string,
    userId: string,
    updateWorkspace: UpdateWorkspaceDto,
  ) {
    const workspace = await this.findOne(userId, workspaceId);
    if (!workspace) {
      throw new BadRequestException(
        "Workspace not found or you don't have permission to update it",
      );
    }
    return await this.prisma.workspace.update({
      where: {
        id: workspaceId,
        ownerId: userId,
      },
      data: updateWorkspace,
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

  /**
   * Finds a public workspace by slug.
   * @param slug The slug of the workspace to find.
   * @returns The public workspace.
   */
  async findPublic(slug: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { slug },
      include: {
        events: {
          where: {
            status: 'PUBLISHED',
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

  /**
   * Get all members of a workspace (including owner info).
   */
  async findMembers(workspaceId: string, requestingUserId: string) {
    // First verify the requesting user has access
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { ownerId: requestingUserId },
          { members: { some: { userId: requestingUserId, removedAt: null } } },
        ],
      },
    });

    if (!workspace) {
      throw new BadRequestException('Workspace not found or access denied');
    }

    const members = await this.prisma.workspaceMember.findMany({
      where: {
        workspaceId,
        removedAt: null, // Only active members
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Also include the owner
    const owner = await this.prisma.user.findUnique({
      where: { id: workspace.ownerId },
      select: { id: true, name: true, email: true },
    });

    return {
      owner,
      members,
    };
  }

  /**
   * Invite a member to a workspace by email.
   * - If user exists: Create pending membership (acceptedAt: null)
   * - If user doesn't exist: Create invite with token
   */
  async inviteMember(
    workspaceId: string,
    ownerId: string,
    memberEmail: string,
    role: 'ADMIN' | 'MEMBER' = 'MEMBER',
  ) {
    // Verify ownership
    const workspace = await this.findOne(ownerId, workspaceId);
    if (!workspace) {
      throw new BadRequestException(
        "Workspace not found or you don't have permission to invite members",
      );
    }

    // Check if email is the owner's
    const owner = await this.prisma.user.findUnique({ where: { id: ownerId } });
    if (owner?.email === memberEmail) {
      throw new BadRequestException('Cannot invite yourself');
    }

    // Find the user to invite
    const userToInvite = await this.prisma.user.findUnique({
      where: { email: memberEmail },
    });

    // Generate invite token
    const inviteToken = this.generateInviteToken();

    if (userToInvite) {
      // User exists - check for existing membership
      const existingMember = await this.prisma.workspaceMember.findFirst({
        where: {
          userId: userToInvite.id,
          workspaceId,
        },
      });

      if (existingMember && !existingMember.removedAt) {
        if (existingMember.acceptedAt) {
          throw new BadRequestException('User is already a member');
        }
        throw new BadRequestException('User already has a pending invite');
      }

      // Reactivate if removed, or create new
      if (existingMember && existingMember.removedAt) {
        return await this.prisma.workspaceMember.update({
          where: { id: existingMember.id },
          data: {
            removedAt: null,
            acceptedAt: null, // Pending
            role,
            inviteToken,
          },
          include: {
            user: { select: { id: true, name: true, email: true } },
            workspace: { select: { id: true, name: true } },
          },
        });
      }

      // Create pending membership for existing user
      return await this.prisma.workspaceMember.create({
        data: {
          workspaceId,
          userId: userToInvite.id,
          role,
          inviteToken,
          acceptedAt: null, // Pending until accepted
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          workspace: { select: { id: true, name: true } },
        },
      });
    } else {
      // User doesn't exist - create invite with email only
      // Check for existing email invite
      const existingInvite = await this.prisma.workspaceMember.findFirst({
        where: {
          inviteEmail: memberEmail,
          workspaceId,
          removedAt: null,
        },
      });

      if (existingInvite) {
        throw new BadRequestException(
          'An invite has already been sent to this email',
        );
      }

      return await this.prisma.workspaceMember.create({
        data: {
          workspaceId,
          role,
          inviteToken,
          inviteEmail: memberEmail,
        },
        include: {
          workspace: { select: { id: true, name: true } },
        },
      });
    }
  }

  /**
   * Get invite info by token (public).
   */
  async getInviteInfo(token: string) {
    const invite = await this.prisma.workspaceMember.findUnique({
      where: { inviteToken: token },
      include: {
        workspace: {
          select: { id: true, name: true, logo: true, description: true },
        },
      },
    });

    if (!invite || invite.removedAt || invite.acceptedAt) {
      throw new BadRequestException('Invalid or expired invite');
    }

    return {
      workspaceId: invite.workspaceId,
      workspace: invite.workspace,
      role: invite.role,
      inviteEmail: invite.inviteEmail,
    };
  }

  /**
   * Accept an invite.
   */
  async acceptInvite(token: string, userId: string) {
    const invite = await this.prisma.workspaceMember.findUnique({
      where: { inviteToken: token },
    });

    if (!invite || invite.removedAt || invite.acceptedAt) {
      throw new BadRequestException('Invalid or expired invite');
    }

    // If invite was for a different user (by userId), reject
    if (invite.userId && invite.userId !== userId) {
      throw new BadRequestException('This invite is for a different user');
    }

    // Accept the invite
    return await this.prisma.workspaceMember.update({
      where: { id: invite.id },
      data: {
        userId, // Link to accepting user
        acceptedAt: new Date(),
        inviteToken: null, // Clear token after acceptance
        inviteEmail: null,
      },
      include: {
        workspace: { select: { id: true, name: true, slug: true, logo: true } },
      },
    });
  }

  /**
   * Decline an invite.
   */
  async declineInvite(token: string) {
    const invite = await this.prisma.workspaceMember.findUnique({
      where: { inviteToken: token },
    });

    if (!invite) {
      throw new BadRequestException('Invite not found');
    }

    return await this.prisma.workspaceMember.update({
      where: { id: invite.id },
      data: { removedAt: new Date() },
    });
  }

  private generateInviteToken(): string {
    return `inv_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Remove a member from a workspace (soft delete).
   * Only workspace owner can remove members.
   */
  async removeMember(workspaceId: string, ownerId: string, memberId: string) {
    // Verify ownership
    const workspace = await this.findOne(ownerId, workspaceId);
    if (!workspace) {
      throw new BadRequestException(
        "Workspace not found or you don't have permission to remove members",
      );
    }

    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        id: memberId,
        workspaceId,
        removedAt: null,
      },
    });

    if (!member) {
      throw new BadRequestException('Member not found');
    }

    // Soft delete by setting removedAt
    return await this.prisma.workspaceMember.update({
      where: { id: memberId },
      data: { removedAt: new Date() },
    });
  }

  /**
   * Update a member's role.
   */
  async updateMemberRole(
    workspaceId: string,
    ownerId: string,
    memberId: string,
    role: 'ADMIN' | 'MEMBER',
  ) {
    const workspace = await this.findOne(ownerId, workspaceId);
    if (!workspace) {
      throw new BadRequestException('Workspace not found or access denied');
    }

    return await this.prisma.workspaceMember.update({
      where: { id: memberId, workspaceId },
      data: { role },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }
}
