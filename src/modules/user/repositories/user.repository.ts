import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { MysqldbRepository } from '@/shared/mysqldb/mysqldb.repository';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class UserRepository extends MysqldbRepository<User> {
  constructor(
    @InjectRepository(User, MysqldbConnection.name)
    repository: Repository<User>,
  ) {
    super(repository);
  }

  async findActiveUsers(): Promise<User[]> {
    return this.find({ role: UserRole.CUSTOMER });
  }
}
