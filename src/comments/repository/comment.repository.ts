import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';

@Injectable()
export class CommentsRepository extends Repository<Comment> {
  constructor(datasource: DataSource) {
    super(Comment, datasource.createEntityManager());
  }
}
