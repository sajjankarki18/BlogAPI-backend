import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './entities/update-post.dto';

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

  @Get()
  getAllPosts(@Query('page') page: number = 1, @Query('limit') limit: number) {
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
