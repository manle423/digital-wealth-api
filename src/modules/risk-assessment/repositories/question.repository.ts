import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../entities/question.entity';
import { MysqldbRepository } from '@/shared/mysqldb/mysqldb.repository';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';

@Injectable()
export class QuestionRepository extends MysqldbRepository<Question> {
  constructor(
    @InjectRepository(Question, MysqldbConnection.name)
    repository: Repository<Question>,
  ) {
    super(repository);
  }
}
