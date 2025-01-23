import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { PostsStatusEnum } from 'src/enums/PostStatus.enum';

export class CreatePostDto {
  @IsNotEmpty({ message: 'Title should not be empty!' })
  title: string;

  @IsNotEmpty({ message: 'Description should not be empty!' })
  description: string;

  @IsEnum({ PostsStatusEnum })
  @IsOptional()
  status?: PostsStatusEnum;
}
