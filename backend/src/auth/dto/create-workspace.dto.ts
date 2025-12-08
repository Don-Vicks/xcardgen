import { IsOptional, IsString } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  logo?: string;
}
