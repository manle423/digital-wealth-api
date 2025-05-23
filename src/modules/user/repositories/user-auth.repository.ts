import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MysqldbRepository } from '@/shared/mysqldb/mysqldb.repository';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { UserAuth } from '../entities/user-auth.entity';

@Injectable()
export class UserAuthRepository extends MysqldbRepository<UserAuth> {
  constructor(
    @InjectRepository(UserAuth, MysqldbConnection.name)
    repository: Repository<UserAuth>,
  ) {
    super(repository);
  }
}
