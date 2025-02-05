import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from '../dto/create-post.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  readonly id: string;
}
