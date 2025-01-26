import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CategoryRepository } from './repository/category.repository';
import { Post } from 'src/posts/entities/post.entity';
import { PostRepository } from '../posts/repositories/repository.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: CategoryRepository,
    @InjectRepository(Post)
    private readonly postRepository: PostRepository,
  ) {}

  async createCategory(
    postId: string,
    categoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['category'],
    });
    if (!post) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: ['post not found'],
        error: 'Not Found',
      });
    }

    //edge case if the user tries to add new category for the post that already has a category
    const postCategory = post.category?.id;
    if (postCategory) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: ['Category for this post already exists!'],
        error: ['Conflict'],
      });
    }

    try {
      const category = this.categoryRepository.create({
        name: categoryDto.name,
        post: [post],
      });

      return await this.categoryRepository.save(category);
    } catch (error) {
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: [error.message],
        error: 'Internal Server',
      });
    }
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: ['category not found!'],
        error: 'Not Found',
      });
    }

    return await this.categoryRepository.findOne({ where: { id } });
  }

  async updateCategory(
    id: string,
    categoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: ['category not found!'],
        error: 'Not Found',
      });
    }

    await this.categoryRepository.update(
      { id },
      {
        name: categoryDto.name,
      },
    );

    return await this.categoryRepository.findOne({ where: { id: id } });
  }

  async deleteCategory(id: string): Promise<{ id: string; message: string }> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: ['category not found!'],
        error: 'Not Found',
      });
    }

    /*
    When deleting a category, first delete the associated foriegn key category in the post table 
    */
    const postCategory = await this.postRepository.find({
      where: {
        category: { id },
      },
    });
    for (const post of postCategory) {
      await this.postRepository.update(post.id, { category: null });
    }

    /*
    While deleteing a category, note that if a parent_id of a category is null or not.
    If a specific a parent_id of a category is not null then it is a child category.

    If the parent_id is null then it is a parent category.
    So if the parent_id is null then check if there are existing child categories to that parent.
    If there are child category to that parent, then restrict the user to delete the parent category directly
    */

    if (category.parent_id === null) {
      const child_category = await this.categoryRepository.findOne({
        where: {
          parent_id: category.id,
        },
      });

      if (child_category) {
        throw new ConflictException({
          statusCode: HttpStatus.CONFLICT,
          message: [
            'category could not be deleted, parent has an existing child category',
          ],
          error: 'Conflict',
        });
      }
    }

    await this.categoryRepository.delete(id);
    return { id: `${id}`, message: 'category has been deleted!' };
  }
}
