import { PostsStatusEnum } from 'src/enums/PostStatus.enum';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
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
}
