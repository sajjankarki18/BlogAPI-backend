import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CategoriesController } from './categories.controller';
import { CategoryService } from './categories.service';
import { Post } from 'src/posts/entities/post.entity';
import { CategoryRepository } from './repository/category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Post]), forwardRef(() => Post)],
  controllers: [CategoriesController],
  providers: [CategoryService, CategoryRepository],
  exports: [CategoryRepository],
})
export class CategoriesModule {}
