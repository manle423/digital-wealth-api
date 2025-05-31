import { BaseEntity } from '@/shared/mysqldb/types/base-entity.type';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '@/modules/user/entities/user.entity';
import { AssetCategory } from './asset-category.entity';
import { AssetType } from '../enums/asset-type.enum';

@Entity('user_assets')
export class UserAsset extends BaseEntity {
  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => AssetCategory, (category) => category.userAssets, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'category_id', referencedColumnName: 'id' })
  category: AssetCategory;

  @Column({ type: 'uuid', name: 'category_id' })
  categoryId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: AssetType,
    default: AssetType.OTHER,
  })
  type: AssetType;

  @Column({ name: 'current_value', type: 'decimal', precision: 15, scale: 2 })
  currentValue: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    name: 'purchase_price',
  })
  purchasePrice: number;

  @Column({ nullable: true, name: 'purchase_date' })
  purchaseDate: Date;

  @Column({ nullable: true, name: 'last_updated' })
  lastUpdated: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currency: string;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    name: 'annual_return',
  })
  annualReturn: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    name: 'market_value',
  })
  marketValue: number;

  @Column({ nullable: true, name: 'valuation_date' })
  valuationDate: Date;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'liquidity_level',
  })
  liquidityLevel: string;

  @Column({ type: 'json', nullable: true, name: 'additional_info' })
  additionalInfo: {
    location?: string;
    condition?: string;
    serialNumber?: string;
    broker?: string;
    accountNumber?: string;
    interestRate?: number;
    maturityDate?: Date;
    dividendYield?: number;
    riskRating?: string;
    [key: string]: any;
  };

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
