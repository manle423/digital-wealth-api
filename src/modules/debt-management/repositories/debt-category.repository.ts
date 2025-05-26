import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DebtCategory } from '../entities/debt-category.entity';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';

@Injectable()
export class DebtCategoryRepository {
  constructor(
    @InjectRepository(DebtCategory, MysqldbConnection.name)
    private readonly debtCategoryRepository: Repository<DebtCategory>,
  ) {}

  async findAll(): Promise<DebtCategory[]> {
    return this.debtCategoryRepository.find({
      where: { isActive: true },
      order: { order: 'ASC', name: 'ASC' },
    });
  }

  async findById(categoryId: string): Promise<DebtCategory | null> {
    return this.debtCategoryRepository.findOne({
      where: { id: categoryId, isActive: true },
    });
  }

  async findByCodeName(codeName: string): Promise<DebtCategory | null> {
    return this.debtCategoryRepository.findOne({
      where: { codeName, isActive: true },
    });
  }

  async create(categoryData: Partial<DebtCategory>): Promise<DebtCategory> {
    const category = this.debtCategoryRepository.create(categoryData);
    return this.debtCategoryRepository.save(category);
  }

  async update(categoryId: string, updateData: Partial<DebtCategory>): Promise<DebtCategory> {
    await this.debtCategoryRepository.update(categoryId, updateData);
    return this.findById(categoryId);
  }

  async softDelete(categoryId: string): Promise<void> {
    await this.debtCategoryRepository.update(categoryId, { isActive: false });
  }

  async exists(categoryId: string): Promise<boolean> {
    const count = await this.debtCategoryRepository.count({
      where: { id: categoryId, isActive: true },
    });
    return count > 0;
  }

  async isCodeNameUnique(codeName: string, excludeId?: string): Promise<boolean> {
    const queryBuilder = this.debtCategoryRepository
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