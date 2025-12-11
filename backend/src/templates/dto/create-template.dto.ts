import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  backgroundImage: string;

  @IsOptional()
  @IsObject()
  canvasData?: Record<string, any>;

  @IsOptional()
  @IsObject()
  properties?: Record<string, any>;

  @IsOptional()
  @IsObject()
  sampleData?: Record<string, any>;

  @IsOptional()
  @IsString()
  workspaceId?: string;
}
