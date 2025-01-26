import { IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsOptional()
  name: string;
}
