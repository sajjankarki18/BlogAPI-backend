import { IsOptional, IsString } from 'class-validator';

export class AddCommentDto {
  @IsString()
  @IsOptional()
  comment: string;
}
