import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetCategory } from '../entities/asset-category.entity';
import { MysqldbRepository } from '@/shared/mysqldb/mysqldb.repository';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';

@Injectable()
export class AssetCategoryRepository extends MysqldbRepository<AssetCategory> {
  constructor(
    @InjectRepository(AssetCategory, MysqldbConnection.name)
    repository: Repository<AssetCategory>,
  ) {
    super(repository);
  }

  async findAllActive(): Promise<AssetCategory[]> {
    return this.find(
      { isActive: true },
      { order: { order: 'ASC' } }
    );
  }

  async findByCodeName(codeName: string): Promise<AssetCategory | null> {
    return this.findOne({ codeName });
  }

  async findWithAssetCount(): Promise<(AssetCategory & { assetCount: number })[]> {
    return this.repository
      .createQueryBuilder('category')
      .leftJoin('category.userAssets', 'assets')
      .addSelect('COUNT(assets.id)', 'assetCount')
      .where('category.isActive = :isActive', { isActive: true })
      .groupBy('category.id')
      .orderBy('category.order', 'ASC')
      .getRawAndEntities()
      .then(result => {
        return result.entities.map((entity, index) => ({
          ...entity,
          assetCount: parseInt(result.raw[index].assetCount) || 0
        }));
      });
  }

  async create(category: AssetCategory): Promise<AssetCategory> {
    return this.repository.save(category);
  }
} 