import { BaseEntity } from '@/shared/mysqldb/types/base-entity.type';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '@/modules/user/entities/user.entity';
import { MetricType } from '../enums/metric-type.enum';

@Entity('financial_metrics')
export class FinancialMetric extends BaseEntity {
  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: MetricType,
  })
  type: MetricType;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  value: number;

  @Column({ name: 'calculation_date' })
  calculationDate: Date;

  @Column({ name: 'period_start', nullable: true })
  periodStart: Date;

  @Column({ name: 'period_end', nullable: true })
  periodEnd: Date;

  @Column({ type: 'json', nullable: true, name: 'calculation_details' })
  calculationDetails: {
    formula?: string;
    inputs?: { [key: string]: number };
    assumptions?: { [key: string]: any };
    notes?: string;
  };

  @Column({ type: 'json', nullable: true, name: 'benchmark_comparison' })
  benchmarkComparison: {
    industryAverage?: number;
    ageGroupAverage?: number;
    incomeGroupAverage?: number;
    percentile?: number;
  };

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  subcategory: string;

  @Column({ default: true, name: 'is_current' })
  isCurrent: boolean;
}
