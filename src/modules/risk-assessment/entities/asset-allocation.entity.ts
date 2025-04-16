import { BaseEntity } from '@/shared/mysqldb/types/base-entity.type';
import { Column, Entity, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { RiskProfile } from './risk-profile.entity';
import { AssetClass } from './asset-class.entity';

@Entity('risk_assessment_allocations')
@Unique(['riskProfileId', 'assetClassId'])
export class AssetAllocation extends BaseEntity {
  @ManyToOne(() => RiskProfile, profile => profile.allocations, { 
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: 'risk_profile_id', referencedColumnName: 'id' })
  riskProfile: RiskProfile;
  
  @Column({ type: 'uuid', name: 'risk_profile_id' })
  riskProfileId: string;
  
  @ManyToOne(() => AssetClass, assetClass => assetClass.allocations, {
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: 'asset_class_id', referencedColumnName: 'id' })
  assetClass: AssetClass;
  
  @Column({ type: 'uuid', name: 'asset_class_id' })
  assetClassId: string;
  
  @Column({ type: 'int' })
  percentage: number;
} 