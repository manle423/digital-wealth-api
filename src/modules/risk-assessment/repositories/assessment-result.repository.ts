import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssessmentResult } from '../entities/assessment-result.entity';
import { MysqldbRepository } from '@/shared/mysqldb/mysqldb.repository';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';

@Injectable()
export class AssessmentResultRepository extends MysqldbRepository<AssessmentResult> {
  constructor(
    @InjectRepository(AssessmentResult, MysqldbConnection.name)
    repository: Repository<AssessmentResult>,
  ) {
    super(repository);
  }
}
