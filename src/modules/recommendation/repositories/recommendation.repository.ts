import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Recommendation } from '../entities/recommendation.entity';
import { MysqldbRepository } from '@/shared/mysqldb/mysqldb.repository';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { DeepPartial } from 'typeorm';
import { RecommendationType } from '../enums/recommendation-type.enum';
import { RecommendationStatus } from '../enums/recommendation-status.enum';
import { RecommendationPriority } from '../enums/recommendation-priority.enum';

@Injectable()
export class RecommendationRepository extends MysqldbRepository<Recommendation> {
  constructor(
    @InjectRepository(Recommendation, MysqldbConnection.name)
    repository: Repository<Recommendation>,
  ) {
    super(repository);
  }

  async create(recommendationData: DeepPartial<Recommendation>): Promise<Recommendation> {
    const recommendation = this.repository.create(recommendationData);
    return this.repository.save(recommendation);
  }

  async findByUserId(userId: string): Promise<Recommendation[]> {
    return this.repository
      .createQueryBuilder('recommendation')
      .where('recommendation.userId = :userId', { userId })
      .orderBy('recommendation.priority', 'DESC')
      .addOrderBy('recommendation.createdAt', 'DESC')
      .getMany();
  }

  async findActiveByUserId(userId: string): Promise<Recommendation[]> {
    return this.repository
      .createQueryBuilder('recommendation')
      .where('recommendation.userId = :userId', { userId })
      .andWhere('recommendation.status = :status', { status: RecommendationStatus.ACTIVE })
      .andWhere('(recommendation.expiresAt IS NULL OR recommendation.expiresAt > :now)', { now: new Date() })
      .orderBy('recommendation.priority', 'DESC')
      .addOrderBy('recommendation.createdAt', 'DESC')
      .getMany();
  }

  async findByUserIdAndType(userId: string, type: RecommendationType): Promise<Recommendation[]> {
    return this.repository
      .createQueryBuilder('recommendation')
      .where('recommendation.userId = :userId', { userId })
      .andWhere('recommendation.type = :type', { type })
      .orderBy('recommendation.createdAt', 'DESC')
      .getMany();
  }

  async findByUserIdAndStatus(userId: string, status: RecommendationStatus): Promise<Recommendation[]> {
    return this.repository
      .createQueryBuilder('recommendation')
      .where('recommendation.userId = :userId', { userId })
      .andWhere('recommendation.status = :status', { status })
      .orderBy('recommendation.createdAt', 'DESC')
      .getMany();
  }

  async findByUserIdAndPriority(userId: string, priority: RecommendationPriority): Promise<Recommendation[]> {
    return this.repository
      .createQueryBuilder('recommendation')
      .where('recommendation.userId = :userId', { userId })
      .andWhere('recommendation.priority = :priority', { priority })
      .andWhere('recommendation.status = :status', { status: RecommendationStatus.ACTIVE })
      .orderBy('recommendation.createdAt', 'DESC')
      .getMany();
  }

  async findExpiredRecommendations(): Promise<Recommendation[]> {
    return this.repository
      .createQueryBuilder('recommendation')
      .where('recommendation.expiresAt < :now', { now: new Date() })
      .andWhere('recommendation.status = :status', { status: RecommendationStatus.ACTIVE })
      .getMany();
  }

  async markAsViewed(id: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(Recommendation)
      .set({ 
        status: RecommendationStatus.VIEWED,
        viewedAt: new Date()
      })
      .where('id = :id', { id })
      .execute();
  }

  async markAsDismissed(id: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(Recommendation)
      .set({ 
        status: RecommendationStatus.DISMISSED,
        dismissedAt: new Date()
      })
      .where('id = :id', { id })
      .execute();
  }

  async markAsCompleted(id: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(Recommendation)
      .set({ 
        status: RecommendationStatus.COMPLETED,
        completedAt: new Date()
      })
      .where('id = :id', { id })
      .execute();
  }

  async markAsInProgress(id: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(Recommendation)
      .set({ status: RecommendationStatus.IN_PROGRESS })
      .where('id = :id', { id })
      .execute();
  }

  async updateUserFeedback(id: string, feedback: string, rating?: number): Promise<void> {
    const updateData: any = { userFeedback: feedback };
    if (rating !== undefined) {
      updateData.userRating = rating;
    }

    await this.repository
      .createQueryBuilder()
      .update(Recommendation)
      .set(updateData)
      .where('id = :id', { id })
      .execute();
  }

  async markExpiredRecommendations(): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(Recommendation)
      .set({ status: RecommendationStatus.EXPIRED })
      .where('expiresAt < :now', { now: new Date() })
      .andWhere('status = :status', { status: RecommendationStatus.ACTIVE })
      .execute();
  }

  async getRecommendationStats(userId: string): Promise<{
    total: number;
    active: number;
    completed: number;
    dismissed: number;
    byPriority: { priority: RecommendationPriority; count: number }[];
    byType: { type: RecommendationType; count: number }[];
  }> {
    const [
      total,
      active,
      completed,
      dismissed,
      byPriority,
      byType
    ] = await Promise.all([
      this.repository.count({ where: { userId } }),
      this.repository.count({ where: { userId, status: RecommendationStatus.ACTIVE } }),
      this.repository.count({ where: { userId, status: RecommendationStatus.COMPLETED } }),
      this.repository.count({ where: { userId, status: RecommendationStatus.DISMISSED } }),
      this.repository
        .createQueryBuilder('recommendation')
        .select('recommendation.priority', 'priority')
        .addSelect('COUNT(*)', 'count')
        .where('recommendation.userId = :userId', { userId })
        .groupBy('recommendation.priority')
        .getRawMany(),
      this.repository
        .createQueryBuilder('recommendation')
        .select('recommendation.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .where('recommendation.userId = :userId', { userId })
        .groupBy('recommendation.type')
        .getRawMany()
    ]);

    return {
      total,
      active,
      completed,
      dismissed,
      byPriority: byPriority.map(item => ({
        priority: item.priority,
        count: parseInt(item.count)
      })),
      byType: byType.map(item => ({
        type: item.type,
        count: parseInt(item.count)
      }))
    };
  }

  async deleteOldRecommendations(userId: string, keepCount: number = 100): Promise<void> {
    const recommendations = await this.repository
      .createQueryBuilder('recommendation')
      .where('recommendation.userId = :userId', { userId })
      .andWhere('recommendation.status IN (:...statuses)', { 
        statuses: [RecommendationStatus.COMPLETED, RecommendationStatus.DISMISSED, RecommendationStatus.EXPIRED] 
      })
      .orderBy('recommendation.createdAt', 'DESC')
      .skip(keepCount)
      .getMany();

    if (recommendations.length > 0) {
      const idsToDelete = recommendations.map(r => r.id);
      await this.repository
        .createQueryBuilder()
        .delete()
        .from(Recommendation)
        .whereInIds(idsToDelete)
        .execute();
    }
  }

  async findSimilarRecommendations(
    userId: string, 
    type: RecommendationType, 
    days: number = 30
  ): Promise<Recommendation[]> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    return this.repository
      .createQueryBuilder('recommendation')
      .where('recommendation.userId = :userId', { userId })
      .andWhere('recommendation.type = :type', { type })
      .andWhere('recommendation.createdAt >= :fromDate', { fromDate })
      .getMany();
  }
}