import { IsEnum, IsNotEmpty, IsOptional, Length } from 'class-validator';
import { PostsStatusEnum } from 'src/enums/PostStatus.enum';

export class CreatePostDto {
  @IsNotEmpty({ message: 'Title should not be empty!' })
  @Length(20, 50, { message: 'title should be between 20 to 50 characters ' })
  title: string;

  @IsNotEmpty({ message: 'Description should not be empty!' })
  @Length(100, 10000, {
    message: 'description should be between 100 to 10000 cbaracters',
  })
  description: string;

  @IsEnum({ PostsStatusEnum })
  @IsOptional()
  status?: PostsStatusEnum;
}
