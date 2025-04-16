import { BaseEntity } from '@/shared/mysqldb/types/base-entity.type';
import { Column, Entity, OneToMany } from 'typeorm';
import { RiskProfileType } from '../enums/risk-profile.enum';
import { AssetAllocation } from './asset-allocation.entity';

@Entity('risk_assessment_profiles')
export class RiskProfile extends BaseEntity {
  @Column({
    type: 'enum',
    enum: RiskProfileType,
    unique: true
  })
  type: RiskProfileType;
  
  @Column()
  name: string;
  
  @Column({ type: 'text' })
  description: string;
  
  @Column({ type: 'int', name: 'min_score' })
  minScore: number;
  
  @Column({ type: 'int', name: 'max_score' })
  maxScore: number;
  
  @OneToMany(() => AssetAllocation, allocation => allocation.riskProfile)
  allocations: AssetAllocation[];
} 