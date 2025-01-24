import { IsOptional } from 'class-validator';

export class AddReplyDto {
  @IsOptional()
  reply: string;
}
