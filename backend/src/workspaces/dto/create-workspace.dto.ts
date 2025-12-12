import { IsEnum, IsOptional, IsString } from 'class-validator';

// Duplicate of Prisma Enum to avoid import issues
export enum WorkspaceType {
  PERSONAL = 'PERSONAL',
  ORGANIZATION = 'ORGANIZATION',
  AGENCY = 'AGENCY',
  EVENT_ORGANIZER = 'EVENT_ORGANIZER',
  CORPORATE_TEAM = 'CORPORATE_TEAM',
  COMMUNITY_DAO = 'COMMUNITY_DAO',
  CREATOR_INFLUENCER = 'CREATOR_INFLUENCER',
}

export class CreateWorkspaceDto {
  @IsString()
  name: string;

  @IsString()
  logo: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsString()
  slug: string;

  @IsEnum(WorkspaceType)
  type: WorkspaceType; // class-validator ensures the string is a valid enum

  @IsString()
  description: string;

  @IsOptional()
  socialLinks?: any;
}
