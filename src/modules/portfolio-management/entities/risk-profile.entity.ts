import { BaseEntity } from '@/shared/mysqldb/types/base-entity.type';
import { Column, Entity, OneToMany } from 'typeorm';
import { AssetAllocation } from './asset-allocation.entity';
import { RiskProfileTranslation } from './risk-profile-translation.entity';
import { RiskProfileType } from '../enums/risk-profile.enum';

@Entity('profiles')
export class RiskProfile extends BaseEntity {
  @Column({
    type: 'enum',
    enum: RiskProfileType,
    unique: true,
  })
  type: RiskProfileType;

  @Column({ type: 'int', name: 'min_score' })
  minScore: number;

  @Column({ type: 'int', name: 'max_score' })
  maxScore: number;

  @OneToMany(() => AssetAllocation, (allocation) => allocation.riskProfile)
  allocations: AssetAllocation[];

  @OneToMany(
    () => RiskProfileTranslation,
    (translation) => translation.riskProfile,
  )
  translations: RiskProfileTranslation[];
}
