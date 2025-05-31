import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { UserAsset } from '../entities/user-asset.entity';
import { MysqldbRepository } from '@/shared/mysqldb/mysqldb.repository';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { AssetType } from '../enums/asset-type.enum';

@Injectable()
export class UserAssetRepository extends MysqldbRepository<UserAsset> {
  constructor(
    @InjectRepository(UserAsset, MysqldbConnection.name)
    repository: Repository<UserAsset>,
  ) {
    super(repository);
  }

  async findByUserId(userId: string): Promise<UserAsset[]> {
    return this.find(
      { userId, isActive: true },
      {
        relations: ['category'],
        order: { createdAt: 'DESC' },
      },
    );
  }

  async findByUserIdAndCategoryId(
    userId: string,
    categoryId: string,
  ): Promise<UserAsset[]> {
    return this.find(
      { userId, categoryId, isActive: true },
      {
        relations: ['category'],
        order: { createdAt: 'DESC' },
      },
    );
  }

  async findByUserIdAndType(
    userId: string,
    type: AssetType,
  ): Promise<UserAsset[]> {
    return this.find(
      { userId, type, isActive: true },
      {
        relations: ['category'],
        order: { createdAt: 'DESC' },
      },
    );
  }

  async getTotalValueByUserId(userId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('asset')
      .select('SUM(asset.currentValue)', 'total')
      .where('asset.userId = :userId', { userId })
      .andWhere('asset.isActive = :isActive', { isActive: true })
      .getRawOne();

    return parseFloat(result?.total) || 0;
  }

  async getAssetBreakdownByUserId(userId: string): Promise<
    {
      categoryId: string;
      categoryName: string;
      totalValue: number;
      assetCount: number;
    }[]
  > {
    return this.repository
      .createQueryBuilder('asset')
      .leftJoin('asset.category', 'category')
      .select([
        'category.id as categoryId',
        'category.name as categoryName',
        'SUM(asset.currentValue) as totalValue',
        'COUNT(asset.id) as assetCount',
      ])
      .where('asset.userId = :userId', { userId })
      .andWhere('asset.isActive = :isActive', { isActive: true })
      .groupBy('category.id')
      .orderBy('totalValue', 'DESC')
      .getRawMany();
  }

  async getAssetsByValueRange(
    userId: string,
    minValue: number,
    maxValue: number,
  ): Promise<UserAsset[]> {
    return this.find(
      {
        userId,
        isActive: true,
        currentValue: Between(minValue, maxValue),
      },
      {
        relations: ['category'],
        order: { currentValue: 'DESC' },
      },
    );
  }

  async getRecentlyUpdatedAssets(
    userId: string,
    days: number = 30,
  ): Promise<UserAsset[]> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    return this.repository
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.category', 'category')
      .where('asset.userId = :userId', { userId })
      .andWhere('asset.isActive = :isActive', { isActive: true })
      .andWhere('asset.lastUpdated >= :fromDate', { fromDate })
      .orderBy('asset.lastUpdated', 'DESC')
      .getMany();
  }

  async getLiquidAssets(userId: string): Promise<UserAsset[]> {
    return this.repository
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.category', 'category')
      .where('asset.userId = :userId', { userId })
      .andWhere('asset.isActive = :isActive', { isActive: true })
      .andWhere('asset.liquidityLevel = :liquidityLevel', {
        liquidityLevel: 'HIGH',
      })
      .orderBy('asset.currentValue', 'DESC')
      .getMany();
  }

  async getAssetsByType(userId: string): Promise<
    {
      type: AssetType;
      totalValue: number;
      assetCount: number;
    }[]
  > {
    return this.repository
      .createQueryBuilder('asset')
      .select([
        'asset.type as type',
        'SUM(asset.currentValue) as totalValue',
        'COUNT(asset.id) as assetCount',
      ])
      .where('asset.userId = :userId', { userId })
      .andWhere('asset.isActive = :isActive', { isActive: true })
      .groupBy('asset.type')
      .orderBy('totalValue', 'DESC')
      .getRawMany();
  }
}
