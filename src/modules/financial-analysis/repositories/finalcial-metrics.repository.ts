import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MysqldbRepository } from '@/shared/mysqldb/mysqldb.repository';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { FinancialMetric } from '../entities/financial-metric.entity';

@Injectable()
export class FinancialMetricRepository extends MysqldbRepository<FinancialMetric> {
  constructor(
    @InjectRepository(FinancialMetric, MysqldbConnection.name)
    repository: Repository<FinancialMetric>,
  ) {
    super(repository);
  }
}