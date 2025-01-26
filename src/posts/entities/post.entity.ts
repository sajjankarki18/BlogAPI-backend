import { Comment } from 'src/comments/entities/comment.entity';
import { PostsStatusEnum } from 'src/enums/PostStatus.enum';
import { Category } from '../../categories/entities/category.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @Column({ default: false })
  is_active: boolean;

  @Column({
    type: 'enum',
    enum: PostsStatusEnum,
    default: PostsStatusEnum.Draft,
  })
  status: PostsStatusEnum;

  /* 
  one to many relationship between the post and comments 
  A post can be associated with many comments
  */
  @OneToMany(() => Comment, (comment) => comment.post)
  comment: Comment[];

  /*
  many to one relationship between the post and category
  many post can be associated with the single category
  */
  @ManyToOne(() => Category, (category) => category.post)
  category: Category;
}
