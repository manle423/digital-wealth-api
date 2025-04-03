import { BaseEntity } from '@/shared/mysqldb/types/base-entity.type';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '@/modules/user/entities/user.entity';
import { RiskProfileType } from '../enums/risk-profile.enum';

@Entity('risk_assessment_results')
export class AssessmentResult extends BaseEntity {
  @ManyToOne(() => User, { nullable: true, createForeignKeyConstraints: false })
  @JoinColumn({ referencedColumnName: 'id' })
  user: User;

  @Column({ type: 'uuid', nullable: true, name: 'user_id' })
  userId: string;

  @Column({ type: 'int', name: 'total_score' })
  totalScore: number;

  @Column({ type: 'enum', enum: RiskProfileType, name: 'risk_profile' })
  riskProfile: RiskProfileType;

  @Column({ type: 'json', name: 'user_responses' })
  userResponses: {
    question: {
      id: string;
      text: string;
      category: string;
    },
    answer: {
      text: string;
      value: number;
    }
  }[];

  @Column({ type: 'json', name: 'recommended_allocation' })
  recommendedAllocation: {
    assetClass: string;
    percentage: number;
  }[];

  @Column({ type: 'text', nullable: true })
  summary: string;
} 