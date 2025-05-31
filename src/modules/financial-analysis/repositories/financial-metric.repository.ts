import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { FinancialMetric } from '../entities/financial-metric.entity';
import { MysqldbRepository } from '@/shared/mysqldb/mysqldb.repository';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { DeepPartial } from 'typeorm';
import { MetricType } from '../enums/metric-type.enum';

@Injectable()
export class FinancialMetricRepository extends MysqldbRepository<FinancialMetric> {
  constructor(
    @InjectRepository(FinancialMetric, MysqldbConnection.name)
    repository: Repository<FinancialMetric>,
  ) {
    super(repository);
  }

  async create(
    metricData: DeepPartial<FinancialMetric>,
  ): Promise<FinancialMetric> {
    const metric = this.repository.create(metricData);
    return this.repository.save(metric);
  }

  async findByUserId(userId: string): Promise<FinancialMetric[]> {
    return this.repository
      .createQueryBuilder('metric')
      .where('metric.userId = :userId', { userId })
      .andWhere('metric.isCurrent = :isCurrent', { isCurrent: true })
      .orderBy('metric.calculationDate', 'DESC')
      .getMany();
  }

  async findByUserIdAndType(
    userId: string,
    type: MetricType,
  ): Promise<FinancialMetric[]> {
    return this.repository
      .createQueryBuilder('metric')
      .where('metric.userId = :userId', { userId })
      .andWhere('metric.type = :type', { type })
      .orderBy('metric.calculationDate', 'DESC')
      .getMany();
  }

  async findLatestByUserIdAndType(
    userId: string,
    type: MetricType,
  ): Promise<FinancialMetric | null> {
    return this.repository
      .createQueryBuilder('metric')
      .where('metric.userId = :userId', { userId })
      .andWhere('metric.type = :type', { type })
      .andWhere('metric.isCurrent = :isCurrent', { isCurrent: true })
      .orderBy('metric.calculationDate', 'DESC')
      .getOne();
  }

  async findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<FinancialMetric[]> {
    return this.repository
      .createQueryBuilder('metric')
      .where('metric.userId = :userId', { userId })
      .andWhere('metric.calculationDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('metric.calculationDate', 'DESC')
      .getMany();
  }

  async findByUserIdTypeAndDateRange(
    userId: string,
    type: MetricType,
    startDate: Date,
    endDate: Date,
  ): Promise<FinancialMetric[]> {
    return this.repository
      .createQueryBuilder('metric')
      .where('metric.userId = :userId', { userId })
      .andWhere('metric.type = :type', { type })
      .andWhere('metric.calculationDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('metric.calculationDate', 'ASC')
      .getMany();
  }

  async findByCategory(
    userId: string,
    category: string,
  ): Promise<FinancialMetric[]> {
    return this.repository
      .createQueryBuilder('metric')
      .where('metric.userId = :userId', { userId })
      .andWhere('metric.category = :category', { category })
      .andWhere('metric.isCurrent = :isCurrent', { isCurrent: true })
      .orderBy('metric.calculationDate', 'DESC')
      .getMany();
  }

  async getMetricTrend(
    userId: string,
    type: MetricType,
    months: number = 12,
  ): Promise<
    {
      date: Date;
      value: number;
    }[]
  > {
    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - months);

    return this.repository
      .createQueryBuilder('metric')
      .select(['metric.calculationDate as date', 'metric.value as value'])
      .where('metric.userId = :userId', { userId })
      .andWhere('metric.type = :type', { type })
      .andWhere('metric.calculationDate >= :fromDate', { fromDate })
      .orderBy('metric.calculationDate', 'ASC')
      .getRawMany();
  }

  async markAsOutdated(userId: string, type: MetricType): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(FinancialMetric)
      .set({ isCurrent: false })
      .where('userId = :userId', { userId })
      .andWhere('type = :type', { type })
      .andWhere('isCurrent = :isCurrent', { isCurrent: true })
      .execute();
  }

  async deleteOldMetrics(
    userId: string,
    keepCount: number = 100,
  ): Promise<void> {
    const metrics = await this.repository
      .createQueryBuilder('metric')
      .where('metric.userId = :userId', { userId })
      .orderBy('metric.calculationDate', 'DESC')
      .skip(keepCount)
      .getMany();

    if (metrics.length > 0) {
      const idsToDelete = metrics.map((m) => m.id);
      await this.repository
        .createQueryBuilder()
        .delete()
        .from(FinancialMetric)
        .whereInIds(idsToDelete)
        .execute();
    }
  }

  async getCurrentMetricsSummary(userId: string): Promise<
    {
      type: MetricType;
      value: number;
      category: string;
      calculationDate: Date;
    }[]
  > {
    return this.repository
      .createQueryBuilder('metric')
      .select([
        'metric.type as type',
        'metric.value as value',
        'metric.category as category',
        'metric.calculationDate as calculationDate',
      ])
      .where('metric.userId = :userId', { userId })
      .andWhere('metric.isCurrent = :isCurrent', { isCurrent: true })
      .orderBy('metric.category', 'ASC')
      .addOrderBy('metric.type', 'ASC')
      .getRawMany();
  }
}
