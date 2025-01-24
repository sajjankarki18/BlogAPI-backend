import { PartialType } from '@nestjs/mapped-types';
import { AddReplyDto } from './add-reply.dto';

export class EditReplyDto extends PartialType(AddReplyDto) {
  readonly id: string;
}
