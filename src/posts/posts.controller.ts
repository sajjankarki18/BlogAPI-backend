import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './entities/update-post.dto';
import { isEmpty } from 'class-validator';

@Controller('/blogs/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  createPosts(@Body() postDto: CreatePostDto) {
    return this.postsService.createPost(postDto);
  }

  @Get('/search')
  getSearchedPost(@Query('q') query: string) {
    return this.postsService.getSearchedPost(query);
  }

  @Get('/:id')
  getPostById(@Param('id') id: string) {
    return this.postsService.getPostById(id);
  }

  @Get('/by-categories')
  getPostsWithCategoryRecords(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    if (isEmpty(page) || isEmpty(limit)) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['page and limit fields are empty!'],
        error: 'Bad Request',
      });
    }
    return this.postsService.getPostsWithCategoryRecords({ page, limit });
  }

  @Get()
  getAllPosts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    if (isEmpty(page) || isEmpty(limit)) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['page and limit fields are empty!'],
        error: 'Bad Request',
      });
    }
    return this.postsService.getAllPosts({ page, limit });
  }

  @Put('/:id')
  updatePost(@Body() postDto: UpdatePostDto, @Param('id') id: string) {
    return this.postsService.updatePost(postDto, id);
  }

  @Delete('/:id')
  deletePost(@Param('id') id: string) {
    return this.postsService.deletePost(id);
  }
}
