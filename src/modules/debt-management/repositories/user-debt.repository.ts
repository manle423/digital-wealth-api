import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { UserDebt } from '../entities/user-debt.entity';
import { GetDebtsDto } from '../dto/get-debts.dto';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { MysqldbRepository } from '@/shared/mysqldb/mysqldb.repository';
import { DeepPartial } from 'typeorm';

@Injectable()
export class UserDebtRepository extends MysqldbRepository<UserDebt> {
  constructor(
    @InjectRepository(UserDebt, MysqldbConnection.name)
    repository: Repository<UserDebt>,
  ) {
    super(repository);
  }

  async findByUserId(userId: string): Promise<UserDebt[]> {
    return this.find({
      userId,
      isActive: true,
    }, {
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserIdWithFilters(userId: string, filters: GetDebtsDto): Promise<{
    debts: UserDebt[];
    total: number;
  }> {
    const queryBuilder = this.createQueryBuilder(userId);
    
    this.applyFilters(queryBuilder, filters);
    this.applySorting(queryBuilder, filters);
    
    const total = await queryBuilder.getCount();
    
    if (filters.page && filters.limit) {
      const skip = (filters.page - 1) * filters.limit;
      queryBuilder.skip(skip).take(filters.limit);
    }

    const debts = await queryBuilder.getMany();
    
    return { debts, total };
  }

  async findByUserIdAndId(userId: string, debtId: string) {
    return this.findOne({
      id: debtId,
      userId,
      isActive: true,
    }, {
      relations: ['category'],
    });
  }

  async findById(debtId: string): Promise<UserDebt | null> {
    return this.findOne({
      id: debtId,
      isActive: true,
    }, {
      relations: ['category'],
    });
  }

  async getTotalDebtValue(userId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('debt')
      .select('SUM(debt.currentBalance)', 'total')
      .where('debt.userId = :userId', { userId })
      .andWhere('debt.isActive = :isActive', { isActive: true })
      .getRawOne();
    return parseFloat(result?.total || '0');
  }

  async getDebtBreakdown(userId: string): Promise<any[]> {
    const result = await this.repository
      .createQueryBuilder('debt')
      .leftJoinAndSelect('debt.category', 'category')
      .select([
        'category.id as categoryId',
        'category.name as categoryName',
        'SUM(debt.currentBalance) as totalValue',
        'COUNT(debt.id) as count'
      ])
      .where('debt.userId = :userId', { userId })
      .andWhere('debt.isActive = :isActive', { isActive: true })
      .groupBy('category.id')
      .getRawMany();
    return result;
  }

  async getOverdueDebts(userId: string): Promise<UserDebt[]> {
    const result = await this.repository
      .createQueryBuilder('debt')
      .leftJoinAndSelect('debt.category', 'category')
      .where('debt.userId = :userId', { userId })
      .andWhere('debt.isActive = :isActive', { isActive: true })
      .andWhere('debt.dueDate < :currentDate', { currentDate: new Date() })
      .andWhere('debt.status != :paidOff', { paidOff: 'PAID_OFF' })
      .orderBy('debt.dueDate', 'ASC')
      .getMany();
    return result;
  }

  async getUpcomingPayments(userId: string, days: number = 30): Promise<UserDebt[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    
    const result = await this.repository
      .createQueryBuilder('debt')
      .leftJoinAndSelect('debt.category', 'category')
      .where('debt.userId = :userId', { userId })
      .andWhere('debt.isActive = :isActive', { isActive: true })
      .andWhere('debt.nextPaymentDate BETWEEN :now AND :futureDate', {
        now: new Date(),
        futureDate
      })
      .orderBy('debt.nextPaymentDate', 'ASC')
      .getMany();
    return result;
  }

  private createQueryBuilder(userId: string): SelectQueryBuilder<UserDebt> {
    return this.repository
      .createQueryBuilder('debt')
      .leftJoinAndSelect('debt.category', 'category')
      .where('debt.userId = :userId', { userId })
      .andWhere('debt.isActive = :isActive', { isActive: true });
  }

  private applyFilters(queryBuilder: SelectQueryBuilder<UserDebt>, filters: GetDebtsDto): void {
    if (filters.type) {
      queryBuilder.andWhere('debt.type = :type', { type: filters.type });
    }

    if (filters.status) {
      queryBuilder.andWhere('debt.status = :status', { status: filters.status });
    }

    if (filters.categoryId) {
      queryBuilder.andWhere('debt.categoryId = :categoryId', { categoryId: filters.categoryId });
    }

    if (filters.creditor) {
      queryBuilder.andWhere('debt.creditor LIKE :creditor', { creditor: `%${filters.creditor}%` });
    }

    if (filters.dueDateFrom) {
      queryBuilder.andWhere('debt.dueDate >= :dueDateFrom', { dueDateFrom: filters.dueDateFrom });
    }

    if (filters.dueDateTo) {
      queryBuilder.andWhere('debt.dueDate <= :dueDateTo', { dueDateTo: filters.dueDateTo });
    }

    if (filters.minAmount) {
      queryBuilder.andWhere('debt.currentBalance >= :minAmount', { minAmount: filters.minAmount });
    }

    if (filters.maxAmount) {
      queryBuilder.andWhere('debt.currentBalance <= :maxAmount', { maxAmount: filters.maxAmount });
    }
  }

  private applySorting(queryBuilder: SelectQueryBuilder<UserDebt>, filters: GetDebtsDto): void {
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'DESC';
    
    queryBuilder.orderBy(`debt.${sortBy}`, sortOrder);
  }

  async create(debtData: DeepPartial<UserDebt>): Promise<UserDebt> {
    const debt = this.repository.create(debtData);
    return this.repository.save(debt);
  }
} 