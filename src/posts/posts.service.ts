import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostRepository } from './repositories/repository.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsStatusEnum } from 'src/enums/PostStatus.enum';
import { UpdatePostDto } from './entities/update-post.dto';
import { ILike } from 'typeorm';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postsRepository: PostRepository,
  ) {}

  async createPost(postDto: CreatePostDto): Promise<Post> {
    try {
      const post = this.postsRepository.create({
        title: postDto.title,
        description: postDto.description,
        status: postDto.status || PostsStatusEnum.Draft,
      });

      return await this.postsRepository.save(post);
    } catch (error) {
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: [error.message],
        error: 'Internal server error',
      });
    }
  }

  async getSearchedPost(
    query: string,
  ): Promise<{ data: Post[]; total: number }> {
    let searchedData: Post[] = [];

    if (query) {
      searchedData = await this.postsRepository.find({
        where: {
          title: ILike(`%${query}%`),
          status: PostsStatusEnum.Published,
          is_active: true,
        },
      });
    } else {
      searchedData = await this.postsRepository.find({
        where: {
          status: PostsStatusEnum.Published,
          is_active: true,
        },
      });
    }

    const searchedPostsLength = searchedData.length;

    return {
      data: searchedData,
      total: searchedPostsLength,
    };
  }

  async getPostById(id: string): Promise<Post> {
    const post = await this.postsRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: ['post not found!'],
        error: 'Not Found',
      });
    }

    return await this.postsRepository.findOne({ where: { id } });
  }

  async getAllPosts({
    page,
    limit,
  }: {
    page: number;
    limit: number;
  }): Promise<{ data: Post[]; total: number; page: number; limit: number }> {
    if (isNaN(Number(page)) || isNaN(Number(limit)) || page < 0 || limit < 0) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['page and limit must be a positive integers'],
        error: 'Bad Request',
      });
    }

    const publishedPostTotal = await this.postsRepository.count({
      where: {
        status: PostsStatusEnum.Published,
        is_active: true,
      },
    });

    let new_limit: number;

    if (limit > 5) {
      new_limit = 5;
    } else {
      new_limit = limit;
    }

    const publishedPost = await this.postsRepository.find({
      where: {
        status: PostsStatusEnum.Published,
        is_active: true,
      },
      skip: (page - 1) * new_limit,
      take: new_limit,
      order: { created_at: 'DESC' },
    });

    return {
      data: publishedPost,
      total: publishedPostTotal,
      page,
      limit: new_limit,
    };
  }

  async updatePost(postDto: UpdatePostDto, id: string): Promise<Post> {
    const post = await this.postsRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: ['post not found!'],
        error: 'Not Found',
      });
    }

    await this.postsRepository.update(
      { id },
      {
        title: postDto.title,
        description: postDto.description,
        status: postDto.status,
      },
    );

    return await this.postsRepository.findOne({ where: { id } });
  }

  async deletePost(id: string) {
    const post = await this.postsRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: ['post not found!'],
        error: 'Not Found',
      });
    }

    await this.postsRepository.delete(id);
    return { id: `${id}`, message: 'post has been deleted!' };
  }
}
