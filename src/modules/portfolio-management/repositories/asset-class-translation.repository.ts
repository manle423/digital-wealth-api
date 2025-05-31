import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MysqldbRepository } from '@/shared/mysqldb/mysqldb.repository';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { AssetClassTranslation } from '../entities/asset-class-translation.entity';

@Injectable()
export class AssetClassTranslationRepository extends MysqldbRepository<AssetClassTranslation> {
  constructor(
    @InjectRepository(AssetClassTranslation, MysqldbConnection.name)
    repository: Repository<AssetClassTranslation>,
  ) {
    super(repository);
  }
}
