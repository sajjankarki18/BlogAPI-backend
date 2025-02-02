import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(datasource: DataSource) {
    super(User, datasource.createEntityManager());
  }
}
