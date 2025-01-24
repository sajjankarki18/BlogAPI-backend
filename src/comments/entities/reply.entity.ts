import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comment } from './comment.entity';

@Entity()
export class Reply {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  reply: string;

  @CreateDateColumn()
  created_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Comment, (comment) => comment.reply)
  comment: Comment;
}
