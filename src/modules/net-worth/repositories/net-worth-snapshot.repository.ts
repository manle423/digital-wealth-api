import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { NetWorthSnapshot } from '../entities/net-worth-snapshot.entity';
import { MysqldbRepository } from '@/shared/mysqldb/mysqldb.repository';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { DeepPartial } from 'typeorm';

@Injectable()
export class NetWorthSnapshotRepository extends MysqldbRepository<NetWorthSnapshot> {
  constructor(
    @InjectRepository(NetWorthSnapshot, MysqldbConnection.name)
    repository: Repository<NetWorthSnapshot>,
  ) {
    super(repository);
  }

  async create(snapshotData: DeepPartial<NetWorthSnapshot>): Promise<NetWorthSnapshot> {
    const snapshot = this.repository.create(snapshotData);
    return this.repository.save(snapshot);
  }

  async findByUserId(userId: string): Promise<NetWorthSnapshot[]> {
    return this.repository
      .createQueryBuilder('snapshot')
      .where('snapshot.userId = :userId', { userId })
      .orderBy('snapshot.snapshotDate', 'DESC')
      .getMany();
  }

  async findByUserIdAndDateRange(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<NetWorthSnapshot[]> {
    return this.repository
      .createQueryBuilder('snapshot')
      .where('snapshot.userId = :userId', { userId })
      .andWhere('snapshot.snapshotDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      })
      .orderBy('snapshot.snapshotDate', 'DESC')
      .getMany();
  }

  async findLatestByUserId(userId: string): Promise<NetWorthSnapshot | null> {
    return this.repository
      .createQueryBuilder('snapshot')
      .where('snapshot.userId = :userId', { userId })
      .orderBy('snapshot.snapshotDate', 'DESC')
      .getOne();
  }

  async findByUserIdWithLimit(userId: string, limit: number): Promise<NetWorthSnapshot[]> {
    return this.repository
      .createQueryBuilder('snapshot')
      .where('snapshot.userId = :userId', { userId })
      .orderBy('snapshot.snapshotDate', 'DESC')
      .limit(limit)
      .getMany();
  }

  async getNetWorthTrend(userId: string, months: number = 12): Promise<{
    date: Date;
    netWorth: number;
    totalAssets: number;
    totalDebts: number;
  }[]> {
    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - months);

    return this.repository
      .createQueryBuilder('snapshot')
      .select([
        'snapshot.snapshotDate as date',
        'snapshot.netWorth as netWorth',
        'snapshot.totalAssets as totalAssets',
        'snapshot.totalDebts as totalDebts'
      ])
      .where('snapshot.userId = :userId', { userId })
      .andWhere('snapshot.snapshotDate >= :fromDate', { fromDate })
      .orderBy('snapshot.snapshotDate', 'ASC')
      .getRawMany();
  }

  async deleteOldSnapshots(userId: string, keepCount: number = 100): Promise<void> {
    // First get the total count of snapshots for this user
    const totalCount = await this.repository
      .createQueryBuilder('snapshot')
      .where('snapshot.userId = :userId', { userId })
      .getCount();

    // If we have more snapshots than we want to keep
    if (totalCount > keepCount) {
      // Calculate how many to delete
      const deleteCount = totalCount - keepCount;

      // Get the IDs of snapshots to delete
      const snapshotsToDelete = await this.repository
        .createQueryBuilder('snapshot')
        .select('snapshot.id')
        .where('snapshot.userId = :userId', { userId })
        .orderBy('snapshot.snapshotDate', 'ASC')
        .limit(deleteCount)
        .getMany();

      if (snapshotsToDelete.length > 0) {
        const idsToDelete = snapshotsToDelete.map(s => s.id);
        await this.repository
          .createQueryBuilder()
          .delete()
          .from(NetWorthSnapshot)
          .whereInIds(idsToDelete)
          .execute();
      }
    }
  }
} 