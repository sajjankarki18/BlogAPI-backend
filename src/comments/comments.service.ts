import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { CommentsRepository } from './repository/comment.repository';
import { Post } from 'src/posts/entities/post.entity';
import { PostRepository } from 'src/posts/repositories/repository.entity';
import { AddCommentDto } from './dto/add-comment.dto';
import { EditCommentDto } from './dto/edit-comment.dto';
import { Reply } from './entities/reply.entity';
import { ReplyRepository } from './repository/reply.repository';
import { AddReplyDto } from './dto/add-reply.dto';
import { EditReplyDto } from './dto/edit-reply.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: CommentsRepository,
    @InjectRepository(Reply)
    private readonly replyRepository: ReplyRepository,
    @InjectRepository(Post)
    private readonly postsRepository: PostRepository,
  ) {}

  async addComment(
    postId: string,
    commentDto: AddCommentDto,
  ): Promise<Comment> {
    const post = await this.postsRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: ['post not found!'],
        error: 'Not Found',
      });
    }

    try {
      const comment = this.commentsRepository.create({
        comment: commentDto.comment,
        post: post,
      });

      return await this.commentsRepository.save(comment);
    } catch (error) {
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: [error.message],
        error: 'Internal server error',
      });
    }
  }

  async getAllComments({ page, limit }): Promise<{
    data: Comment[];
    total: number;
    page: number;
    limit: number;
  }> {
    if (isNaN(Number(page)) || isNaN(Number(limit)) || page < 0 || limit < 0) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['page and limit must be a positive integers'],
        error: 'Bad Request',
      });
    }

    const new_limit: number = limit > 15 ? 15 : limit;

    const [data, total] = await this.commentsRepository.findAndCount({
      skip: (page - 1) * new_limit,
      take: new_limit,
      order: { created_at: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit: new_limit,
    };
  }

  async getCommentById(id: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({ where: { id } });

    if (!comment) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: ['post not found!'],
        error: 'Not Found',
      });
    }

    return await this.commentsRepository.findOne({ where: { id } });
  }

  async editComment(id: string, commentDto: EditCommentDto): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({ where: { id } });

    if (!comment) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: ['post not found!'],
        error: 'Not Found',
      });
    }

    await this.commentsRepository.update(
      { id },
      {
        comment: commentDto.comment,
      },
    );

    return await this.commentsRepository.findOne({ where: { id } });
  }

  async deleteComment(id: string) {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['reply'],
    });

    if (!comment) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: ['post not found!'],
        error: 'Not Found',
      });
    }

    //while deleting the comments, also delete the associated replies of that comments
    const commentReply = await this.replyRepository.find({
      where: {
        comment: { id },
      },
    });
    if (commentReply) {
      await this.replyRepository.delete({ comment: { id } });
    }

    await this.commentsRepository.delete(id);
    return { id: `${id}`, message: 'comment has been deleted!' };
  }

  /* Replies service */
  async addReply(commentId: string, replyDto: AddReplyDto): Promise<Reply> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: ['post not found!'],
        error: 'Not Found',
      });
    }

    try {
      const reply = this.replyRepository.create({
        reply: replyDto.reply,
        comment: comment,
      });

      return await this.replyRepository.save(reply);
    } catch (error) {
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: [error.message],
        error: 'Internal server error',
      });
    }
  }

  async getReplyById(id: string): Promise<Reply> {
    const reply = await this.replyRepository.findOne({ where: { id } });

    if (!reply) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: ['post not found!'],
        error: 'Not Found',
      });
    }

    return await this.replyRepository.findOne({ where: { id } });
  }

  async editReply(id: string, replyDto: EditReplyDto): Promise<Reply> {
    const reply = await this.replyRepository.findOne({ where: { id } });

    if (!reply) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: ['post not found!'],
        error: 'Not Found',
      });
    }

    await this.replyRepository.update(
      { id },
      {
        reply: replyDto.reply,
      },
    );

    return await this.replyRepository.findOne({ where: { id } });
  }

  async deleteReply(id: string) {
    const reply = await this.replyRepository.findOne({ where: { id } });

    if (!reply) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: ['post not found!'],
        error: 'Not Found',
      });
    }

    await this.replyRepository.delete(id);
    return { id: `${id}`, message: 'comment has been deleted!' };
  }
}
