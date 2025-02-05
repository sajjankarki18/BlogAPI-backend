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
import { ILike } from 'typeorm';
import { CommentsRepository } from '../comments/repository/comment.repository';
import { Comment } from 'src/comments/entities/comment.entity';
import { Category } from '../categories/entities/category.entity';
import { CategoryRepository } from '../categories/repository/category.repository';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postsRepository: PostRepository,
    @InjectRepository(Comment)
    private readonly commentsRepository: CommentsRepository,
    @InjectRepository(Category)
    private readonly categoriesRepository: CategoryRepository,
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

  //get route to fetch the post with the category data
  async getPostsWithCategoryRecords({
    page,
    limit,
  }: {
    page: number;
    limit: number;
  }): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    //edge cases
    //Check weather the page and limit are sent correctly from the front end, they should be a positive integers
    if (isNaN(Number(page)) || isNaN(Number(limit)) || page < 0 || limit < 0) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['page and limit must be a positive integers'],
        error: 'Bad Request',
      });
    }

    //if the limit is greater then 5 set it as statically 5
    const new_limit: number = limit > 5 ? 5 : limit;

    //count the total number of posts based on their post status and active status
    const [postsData, total] = await this.postsRepository.findAndCount({
      relations: ['category'],
      where: {
        status: PostsStatusEnum.Published,
        is_active: true,
      },
      skip: (page - 1) * new_limit,
      take: new_limit,
      order: { created_at: 'desc' },
    });

    //fetch the category data -> to retrieve all the categories associated with the posts by loopin through the post data.
    const categories = await this.categoriesRepository.find();

    const postCategoryData: any[] = []; // Initialize the array to store the post with catagory data

    for (const post of postsData) {
      const postCategory = post.category?.id; //first check if the category of that post exists

      if (postCategory) {
        const categoriesData = categories.find(
          (category) => category.id === post.category.id,
        );

        postCategoryData.push({
          ...post,
          category: {
            name: categoriesData ? categoriesData.name : null,
            id: categoriesData ? categoriesData.id : null,
          },
        });
      } else {
        //set it as null if there is no category for that post
        postCategoryData.push({
          ...post,
          category: {
            name: null,
            id: null,
          },
        });
      }
    }
    return {
      data: postCategoryData,
      total,
      page,
      limit: new_limit,
    };
  }

  async filterPosts(category_name: string): Promise<{ data: any[] }> {
    try {
      const posts = await this.postsRepository.find({
        where: {
          status: PostsStatusEnum.Published,
        },
        relations: ['category'],
      });
      const categories = await this.categoriesRepository.find();
      const filtered_posts: any[] = [];

      const filtered_categories = categories.filter((cat) => {
        const category = cat.name === category_name;
        if (!category) {
          throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            message: ['category not found'],
            error: 'Not Found',
          });
        }
        return category;
      });

      for (const category of filtered_categories) {
        posts.filter((post) => {
          const categoryId = post.category?.id;
          const postsCategory = categoryId === category.id;

          filtered_posts.push({
            postsCategory,
          });
        });
      }

      return {
        data: filtered_categories,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ['some error occured while filtering categories', error],
        error: 'Internal server',
      });
    }
  }

  //get route to fetch only the post data
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

    const new_limit: number = limit > 5 ? 5 : limit;

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

  async deletePost(id: string): Promise<{ id: string; message: string }> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['comment', 'category'],
    });

    if (!post) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: ['post not found!'],
        error: 'Not Found',
      });
    }

    /* 
    since we are soft deleting a post we can just update the deleted at as new Date object.
    Set is_active as false.
    */
    await this.postsRepository.update(
      { id },
      { deleted_at: new Date(), is_active: false },
    );

    //before deleteing the post, delete the associated comments to that post
    const postComment = await this.commentsRepository.find({
      where: {
        post: { id },
      },
    });
    if (postComment) {
      await this.commentsRepository.delete({ post: { id } });
    }

    //delete the associated category
    if (post.category) {
      const postCategory = await this.categoriesRepository.findOne({
        where: {
          id: post.category.id,
        },
      });
      if (postCategory) {
        await this.categoriesRepository.delete({ id: post.category.id });
      }
    }

    return { id: `${id}`, message: 'post has been deleted!' };
  }
}
