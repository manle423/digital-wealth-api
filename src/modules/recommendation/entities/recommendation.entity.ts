import { BaseEntity } from '@/shared/mysqldb/types/base-entity.type';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '@/modules/user/entities/user.entity';
import { RecommendationType } from '../enums/recommendation-type.enum';
import { RecommendationPriority } from '../enums/recommendation-priority.enum';
import { RecommendationStatus } from '../enums/recommendation-status.enum';

@Entity('recommendations')
export class Recommendation extends BaseEntity {
  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: RecommendationType
  })
  type: RecommendationType;

  @Column({
    type: 'enum',
    enum: RecommendationPriority,
    default: RecommendationPriority.MEDIUM
  })
  priority: RecommendationPriority;

  @Column({
    type: 'enum',
    enum: RecommendationStatus,
    default: RecommendationStatus.ACTIVE
  })
  status: RecommendationStatus;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  rationale: string;

  @Column({ type: 'json', nullable: true, name: 'action_steps' })
  actionSteps: {
    step: number;
    description: string;
    isCompleted: boolean;
    completedAt?: Date;
  }[];

  @Column({ type: 'json', nullable: true, name: 'expected_impact' })
  expectedImpact: {
    financialImpact?: number;
    timeframe?: string;
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
    description?: string;
  };

  @Column({ type: 'json', nullable: true, name: 'trigger_conditions' })
  triggerConditions: {
    metricType?: string;
    threshold?: number;
    comparison?: 'GREATER_THAN' | 'LESS_THAN' | 'EQUAL_TO';
    currentValue?: number;
  };

  @Column({ nullable: true, name: 'expires_at' })
  expiresAt: Date;

  @Column({ nullable: true, name: 'viewed_at' })
  viewedAt: Date;

  @Column({ nullable: true, name: 'dismissed_at' })
  dismissedAt: Date;

  @Column({ nullable: true, name: 'completed_at' })
  completedAt: Date;

  @Column({ type: 'text', nullable: true, name: 'user_feedback' })
  userFeedback: string;

  @Column({ type: 'int', nullable: true, name: 'user_rating' })
  userRating: number;

  @Column({ type: 'json', nullable: true })
  metadata: {
    sourceModule?: string;
    relatedEntityId?: string;
    calculationDate?: Date;
    version?: string;
    [key: string]: any;
  };
} 