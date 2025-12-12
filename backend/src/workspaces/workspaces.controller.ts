import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/auth/decorators/public.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { User } from 'src/users/entities/user.entity';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspacesService } from './workspaces.service';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(
    private readonly workspacesService: WorkspacesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('upload-logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(@UploadedFile() file: any) {
    return this.cloudinaryService.uploadImage(file, 'workspaces');
  }

  @Post('upload-cover')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCover(@UploadedFile() file: any) {
    return this.cloudinaryService.uploadImage(file, 'workspaces/covers');
  }

  @Post()
  create(
    @Body() createWorkspaceDto: CreateWorkspaceDto,
    @CurrentUser() user: User,
  ) {
    return this.workspacesService.create(user.id, createWorkspaceDto);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.workspacesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.workspacesService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
    @CurrentUser() user: User,
  ) {
    return this.workspacesService.update(id, user.id, updateWorkspaceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.workspacesService.remove(id, user.id);
  }

  @Get('check-slug/:slug')
  checkSlug(@Param('slug') slug: string) {
    return this.workspacesService.checkSlug(slug);
  }

  @Public()
  @Get('public/:slug')
  getPublic(@Param('slug') slug: string) {
    return this.workspacesService.findPublic(slug);
  }

  // ===== MEMBER MANAGEMENT =====

  @Get(':id/members')
  getMembers(@Param('id') id: string, @CurrentUser() user: User) {
    return this.workspacesService.findMembers(id, user.id);
  }

  @Post(':id/members/invite')
  inviteMember(
    @Param('id') id: string,
    @Body() body: { email: string; role?: 'ADMIN' | 'MEMBER' },
    @CurrentUser() user: User,
  ) {
    return this.workspacesService.inviteMember(
      id,
      user.id,
      body.email,
      body.role,
    );
  }

  @Delete(':id/members/:memberId')
  removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: User,
  ) {
    return this.workspacesService.removeMember(id, user.id, memberId);
  }

  @Patch(':id/members/:memberId')
  updateMemberRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() body: { role: 'ADMIN' | 'MEMBER' },
    @CurrentUser() user: User,
  ) {
    return this.workspacesService.updateMemberRole(
      id,
      user.id,
      memberId,
      body.role,
    );
  }

  // ===== INVITE ENDPOINTS (PUBLIC) =====

  @Public()
  @Get('invite/:token')
  getInviteInfo(@Param('token') token: string) {
    return this.workspacesService.getInviteInfo(token);
  }

  @Post('invite/:token/accept')
  acceptInvite(@Param('token') token: string, @CurrentUser() user: User) {
    return this.workspacesService.acceptInvite(token, user.id);
  }

  @Public()
  @Post('invite/:token/decline')
  declineInvite(@Param('token') token: string) {
    return this.workspacesService.declineInvite(token);
  }
}
