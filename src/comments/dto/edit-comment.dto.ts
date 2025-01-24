import { PartialType } from '@nestjs/mapped-types';
import { AddCommentDto } from './add-comment.dto';

export class EditCommentDto extends PartialType(AddCommentDto) {
  readonly id: string;
}
