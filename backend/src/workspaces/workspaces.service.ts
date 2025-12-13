import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

import { EmailService } from 'src/email/email.service';

import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

import { PaymentsService } from 'src/payments/payments.service';

@Injectable()
export class WorkspacesService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private cloudinaryService: CloudinaryService,
    private paymentsService: PaymentsService,
  ) {}

  /**
   * Creates a new workspace for a user.
   * @param userId The ID of the user creating the workspace.
   * @param createWorkspace The data for the new workspace.
   * @returns The created workspace.
   */
  async create(userId: string, createWorkspace: CreateWorkspaceDto) {
    const currentCount = await this.prisma.workspace.count({
      where: { ownerId: userId },
    });
    await this.paymentsService.checkUsageLimit(
      userId,
      'workspaces',
      currentCount,
    );

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
    // Check for image replacements to delete old assets
    if (
      updateWorkspace.logo &&
      workspace.logo &&
      updateWorkspace.logo !== workspace.logo
    ) {
      // Extract public ID from URL strictly if it matches our Cloudinary URL structure
      // Assuming URL format: .../upload/v1234/folder/id.jpg
      await this.cloudinaryService.deleteImageFromUrl(workspace.logo);
    }
    if (
      updateWorkspace.coverImage &&
      workspace.coverImage &&
      updateWorkspace.coverImage !== workspace.coverImage
    ) {
      await this.cloudinaryService.deleteImageFromUrl(workspace.coverImage);
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
        "You don't have permission to invite members",
      );
    }

    // Check member limit (excluding owner)
    const currentMemberCount = await this.prisma.workspaceMember.count({
      where: { workspaceId, removedAt: null },
    });
    await this.paymentsService.checkUsageLimit(
      ownerId,
      'members',
      currentMemberCount,
    );

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
        const member = await this.prisma.workspaceMember.update({
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
        await this.sendInviteEmail(memberEmail, workspace.name, inviteToken);
        return member;
      }

      // Create pending membership for existing user
      const member = await this.prisma.workspaceMember.create({
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
      await this.sendInviteEmail(memberEmail, workspace.name, inviteToken);
      return member;
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

      const member = await this.prisma.workspaceMember.create({
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
      await this.sendInviteEmail(memberEmail, workspace.name, inviteToken);
      return member;
    }
  }

  private async sendInviteEmail(
    email: string,
    workspaceName: string,
    token: string,
  ) {
    const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${token}`;
    const subject = `Join ${workspaceName} on xCardGen`;

    // Simple, clean email styling
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #0c0c0c; font-size: 24px; font-weight: 700; margin: 0;">xCardGen</h1>
        </div>
        
        <div style="border: 1px solid #eaeaea; border-radius: 12px; padding: 40px; text-align: center;">
          <h2 style="color: #111; font-size: 20px; margin-top: 0; margin-bottom: 16px;">You've been invited!</h2>
          
          <p style="color: #444; font-size: 16px; line-height: 24px; margin-bottom: 32px;">
            You have been invited to join the <strong>${workspaceName}</strong> workspace. Collaborate with your team to create stunning event assets.
          </p>

          <div style="margin-bottom: 32px;">
            <a href="${inviteUrl}" style="display: inline-block; background-color: #000000; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; transition: background-color 0.2s;">
              Accept Invitation
            </a>
          </div>

          <p style="color: #666; font-size: 14px; margin-bottom: 0;">
            <a href="${inviteUrl}" style="color: #666; text-decoration: underline;">${inviteUrl}</a>
          </p>
        </div>

        <div style="text-align: center; margin-top: 32px;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            If you were not expecting this invitation, you can simply ignore this email.
          </p>
        </div>
      </div>
    `;

    await this.emailService.sendEmail(email, subject, html);
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

    // Verify email for new user invites
    if (invite.inviteEmail) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.email && user.email !== invite.inviteEmail) {
        throw new BadRequestException(
          `This invite was sent to ${invite.inviteEmail}. You are logged in as ${user.email}.`,
        );
      }
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
    // Verify ownership or self-removal
    if (ownerId !== memberId) {
      const workspace = await this.findOne(ownerId, workspaceId);
      if (!workspace) {
        // Double check: if the user is trying to remove *themselves*, ownerId passed in might be their own ID.
        // The controller likely passes `req.user.id` as `ownerId`.
        // So we need to check if the memberId being removed belongs to the requesting user.

        // Let's resolve the memberId to a userId first to be safe, OR check if the memberId is the one requesting.
        // Wait, memberId passed here is the workspaceMember ID, NOT the User ID.
        // ownerId is the User ID of the requester.

        const memberRecord = await this.prisma.workspaceMember.findUnique({
          where: { id: memberId },
          include: { user: true },
        });

        if (!memberRecord || memberRecord.userId !== ownerId) {
          // If not self-removal (user IDs match), then we enforce workspace ownership.
          const workspaceOwnerCheck = await this.prisma.workspace.findFirst({
            where: { id: workspaceId, ownerId },
          });
          if (!workspaceOwnerCheck) {
            throw new BadRequestException(
              "You don't have permission to remove this member",
            );
          }
        }
      }
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
