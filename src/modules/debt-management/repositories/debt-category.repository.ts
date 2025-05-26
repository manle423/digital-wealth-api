import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DebtCategory } from '../entities/debt-category.entity';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { MysqldbRepository } from '@/shared/mysqldb/mysqldb.repository';

@Injectable()
export class DebtCategoryRepository extends MysqldbRepository<DebtCategory> {
  constructor(
    @InjectRepository(DebtCategory, MysqldbConnection.name)
    repository: Repository<DebtCategory>,
  ) {
    super(repository);
  }

  async findAll(): Promise<DebtCategory[]> {
    return this.find(
      { isActive: true },
      { order: { order: 'ASC', name: 'ASC' } },
    );
  }

  async findById(categoryId: string): Promise<DebtCategory | null> {
    return this.findOne({
      id: categoryId, isActive: true
    });
  }

  async findByCodeName(codeName: string): Promise<DebtCategory | null> {
    return this.findOne({
      codeName, isActive: true
    });
  }

  async create(categoryData: Partial<DebtCategory>) {
    const category = this.create(categoryData);
    return this.save(category);
  }

  async exists(categoryId: string): Promise<boolean> {
    const count = await this.count({
      id: categoryId, isActive: true
    });
    return count > 0;
  }

  async isCodeNameUnique(codeName: string, excludeId?: string): Promise<boolean> {
    const queryBuilder = this.repository
      .createQueryBuilder('category')
      .where('category.codeName = :codeName', { codeName })
      .andWhere('category.isActive = :isActive', { isActive: true });

    if (excludeId) {
      queryBuilder.andWhere('category.id != :excludeId', { excludeId });
    }

    const count = await queryBuilder.getCount();
    return count === 0;
  }
} 