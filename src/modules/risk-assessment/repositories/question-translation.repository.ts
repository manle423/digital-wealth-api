import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { MysqldbRepository } from '@/shared/mysqldb/mysqldb.repository';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { QuestionTranslation } from '../entities/question-translation.entity';

@Injectable()
export class QuestionTranslationRepository extends MysqldbRepository<QuestionTranslation> {
  constructor(
    @InjectRepository(QuestionTranslation, MysqldbConnection.name)
    repository: Repository<QuestionTranslation>,
  ) {
    super(repository);
  }
}
