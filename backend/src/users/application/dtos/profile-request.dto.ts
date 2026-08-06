import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ProfileRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nombre?: string | null;
}
