import { IsJSON, IsString } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  name: string;

  @IsString()
  logo: string;

  @IsJSON()
  socialLinks: any; // expects a JSON object
}
