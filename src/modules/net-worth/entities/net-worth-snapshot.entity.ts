import { BaseEntity } from '@/shared/mysqldb/types/base-entity.type';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '@/modules/user/entities/user.entity';

@Entity('net_worth_snapshots')
export class NetWorthSnapshot extends BaseEntity {
  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ name: 'snapshot_date' })
  snapshotDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'total_assets' })
  totalAssets: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'total_debts' })
  totalDebts: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'net_worth' })
  netWorth: number;

  @Column({ type: 'json', name: 'asset_breakdown' })
  assetBreakdown: {
    categoryId: string;
    categoryName: string;
    totalValue: number;
    percentage: number;
  }[];

  @Column({ type: 'json', name: 'debt_breakdown' })
  debtBreakdown: {
    categoryId: string;
    categoryName: string;
    totalValue: number;
    percentage: number;
  }[];

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, name: 'liquid_assets' })
  liquidAssets: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, name: 'investment_assets' })
  investmentAssets: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, name: 'real_estate_assets' })
  realEstateAssets: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, name: 'personal_assets' })
  personalAssets: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, name: 'short_term_debts' })
  shortTermDebts: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, name: 'long_term_debts' })
  longTermDebts: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false, name: 'is_manual' })
  isManual: boolean;
} 