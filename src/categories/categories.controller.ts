import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CategoryService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('/blogs/categories')
export class CategoriesController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('/:postId')
  createCategory(
    @Param('postId') postId: string,
    @Body() categoryDto: CreateCategoryDto,
  ) {
    return this.categoryService.createCategory(postId, categoryDto);
  }

  @Get('/:id')
  getPostById(@Param('id') id: string) {
    return this.categoryService.getCategoryById(id);
  }

  @Put('/:id')
  updateCategory(
    @Param('id') id: string,
    @Body() categoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(id, categoryDto);
  }

  @Delete('/:id')
  deleteCategory(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id);
  }
}
