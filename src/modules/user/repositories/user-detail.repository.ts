import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDetail } from '../entities/user-detail.entity';
import { MysqldbRepository } from '@/shared/mysqldb/mysqldb.repository';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';

@Injectable()
export class UserDetailRepository extends MysqldbRepository<UserDetail> {
  constructor(
    @InjectRepository(UserDetail, MysqldbConnection.name)
    repository: Repository<UserDetail>,
  ) {
    super(repository);
  }
}
