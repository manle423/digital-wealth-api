import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MysqldbRepository } from '@/shared/mysqldb/mysqldb.repository';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { UserOtp } from '../entities/user-otp.entity';

@Injectable()
export class UserOtpRepository extends MysqldbRepository<UserOtp> {
  constructor(
    @InjectRepository(UserOtp, MysqldbConnection.name)
    repository: Repository<UserOtp>,
  ) {
    super(repository);
  }
}
