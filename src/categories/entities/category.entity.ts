import { Post } from 'src/posts/entities/post.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  parent_id: string;

  @Column({ nullable: false })
  name: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  /*
    one to many relationship between the post and categories
    many categories can be associated with one post
  */
  @OneToMany(() => Post, (post) => post.category)
  post: Post[];
}
