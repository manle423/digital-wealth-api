import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { MysqldbRepository } from '@/shared/mysqldb/mysqldb.repository';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { RiskProfileTranslation } from '../entities/risk-profile-translation.entity';

@Injectable()
export class RiskProfileTranslationRepository extends MysqldbRepository<RiskProfileTranslation> {
  constructor(
    @InjectRepository(RiskProfileTranslation, MysqldbConnection.name)
    repository: Repository<RiskProfileTranslation>,
  ) {
    super(repository);
  }
}
