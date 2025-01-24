import { forwardRef, Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from 'src/posts/entities/post.entity';
import { PostsModule } from '../posts/posts.module';
import { CommentsRepository } from './repository/comment.repository';
import { Reply } from './entities/reply.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Post, Reply]),
    forwardRef(() => PostsModule),
  ],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsRepository],
  exports: [CommentsRepository],
})
export class CommentsModule {}
