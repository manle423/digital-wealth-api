import { BaseEntity } from '@/shared/mysqldb/types/base-entity.type';
import { Column, Entity, OneToMany } from 'typeorm';
import { AssetAllocation } from './asset-allocation.entity';
import { AssetClassTranslation } from './asset-class-translation.entity';

@Entity('asset_classes')
export class AssetClass extends BaseEntity {
  @OneToMany(() => AssetClassTranslation, translation => translation.assetClass)
  translations: AssetClassTranslation[];

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column()
  order: number;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true, name: 'risk_level' })
  riskLevel: number;

  @Column({ nullable: true, name: 'expected_return' })
  expectedReturn: number;

  @OneToMany(() => AssetAllocation, allocation => allocation.assetClass)
  allocations: AssetAllocation[];
} 