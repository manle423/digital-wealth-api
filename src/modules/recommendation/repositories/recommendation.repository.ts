import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recommendation } from '../entities/recommendation.entity';
import { MysqldbRepository } from '@/shared/mysqldb/mysqldb.repository';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';

@Injectable()
export class RecommendationRepository extends MysqldbRepository<Recommendation> {
  constructor(
    @InjectRepository(Recommendation, MysqldbConnection.name)
    repository: Repository<Recommendation>,
  ) {
    super(repository);
  }
}