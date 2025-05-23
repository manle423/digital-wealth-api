import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetAllocation } from '../entities/asset-allocation.entity';
import { MysqldbRepository } from '@/shared/mysqldb/mysqldb.repository';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';

@Injectable()
export class AssetAllocationRepository extends MysqldbRepository<AssetAllocation> {
  constructor(
    @InjectRepository(AssetAllocation, MysqldbConnection.name)
    repository: Repository<AssetAllocation>,
  ) {
    super(repository);
  }

  async findByRiskProfileId(riskProfileId: string): Promise<AssetAllocation[]> {
    return this.find({
      riskProfileId
    }, {
      relations: ['assetClass.translations'],
      order: { 'assetClass': { 'order': 'ASC' } }
    });
  }
} 