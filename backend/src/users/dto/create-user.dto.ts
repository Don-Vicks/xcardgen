import { IsString, IsEmail, IsJSON } from 'class-validator';
export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class CreateWorkspaceDto {
  @IsString()
  name: string;

  @IsString()
  logo: string;

  @IsString()
  slug: string;

  @IsString()
  type: string;

  @IsString()
  description: string;

  @IsJSON()
  socialLinks: Record<string, any>;
}
