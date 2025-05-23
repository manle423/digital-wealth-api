import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { AssetClass } from '../entities/asset-class.entity';
import { MysqldbRepository } from '@/shared/mysqldb/mysqldb.repository';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { GetAssetClassesDto } from '../dto/asset/get-asset-classes.dto';
import { IPagination } from '@/shared/mysqldb/interfaces/pagination.interface';
import { SortDirection } from '@/shared/mysqldb/enums/sort-direction.enum';

@Injectable()
export class AssetClassRepository extends MysqldbRepository<AssetClass> {
  constructor(
    @InjectRepository(AssetClass, MysqldbConnection.name)
    repository: Repository<AssetClass>,
  ) {
    super(repository);
  }

  async findActive(): Promise<AssetClass[]> {
    return this.find({
      isActive: true
    }, {
      order: { order: 'ASC' }
    });
  }

  /**
   * Lấy danh sách asset classes với phân trang và lọc
   * @param query Tham số phân trang và lọc
   * @param pagination Thông tin phân trang
   * @returns Mảng [items, totalCount]
   */
  async findAllAssetClasses(
    query?: Partial<GetAssetClassesDto>,
    pagination?: Partial<IPagination>
  ): Promise<[AssetClass[], number]> {
    const { isActive, sortBy = 'order', sortDirection = SortDirection.ASC } = query || {};

    const qb = this.repository.createQueryBuilder('assetClass');

    if (isActive !== undefined) {
      const booleanValue = isActive === 'false' ? false : true;
      qb.andWhere('assetClass.isActive = :isActive', { isActive: booleanValue });
    }

    qb.orderBy(`assetClass.${sortBy}`, sortDirection);

    if (!pagination) {
      return qb.getManyAndCount();
    }

    const results = await qb
      .take(pagination.limit)
      .skip(pagination.offset)
      .getManyAndCount();

    return results;
  }

  async deleteById(id: string): Promise<DeleteResult> {
    return this.delete({ id });
  }
} 