import { BaseEntity } from '@/shared/mysqldb/types/base-entity.type';
import { Column, Entity, OneToMany } from 'typeorm';
import { AssetAllocation } from './asset-allocation.entity';

@Entity('risk_assessment_asset_classes')
export class AssetClass extends BaseEntity {
  @Column({ unique: true })
  name: string;
  
  @Column({ type: 'text', nullable: true })
  description: string;
  
  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;
  
  @OneToMany(() => AssetAllocation, allocation => allocation.assetClass)
  allocations: AssetAllocation[];
} 