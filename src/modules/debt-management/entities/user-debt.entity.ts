import { BaseEntity } from '@/shared/mysqldb/types/base-entity.type';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '@/modules/user/entities/user.entity';
import { DebtCategory } from './debt-category.entity';
import { DebtType } from '../enums/debt-type.enum';
import { DebtStatus } from '../enums/debt-status.enum';

@Entity('user_debts')
export class UserDebt extends BaseEntity {
  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => DebtCategory, category => category.userDebts, { 
    createForeignKeyConstraints: false 
  })
  @JoinColumn({ name: 'category_id', referencedColumnName: 'id' })
  category: DebtCategory;

  @Column({ type: 'uuid', name: 'category_id' })
  categoryId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: DebtType,
    default: DebtType.OTHER
  })
  type: DebtType;

  @Column({
    type: 'enum',
    enum: DebtStatus,
    default: DebtStatus.ACTIVE
  })
  status: DebtStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'original_amount' })
  originalAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'current_balance' })
  currentBalance: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'interest_rate' })
  interestRate: number;

  @Column({ nullable: true, name: 'start_date' })
  startDate: Date;

  @Column({ nullable: true, name: 'due_date' })
  dueDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, name: 'monthly_payment' })
  monthlyPayment: number;

  @Column({ nullable: true })
  creditor: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currency: string;

  @Column({ type: 'int', nullable: true, name: 'term_months' })
  termMonths: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, name: 'total_paid' })
  totalPaid: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, name: 'total_interest' })
  totalInterest: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'penalty_rate' })
  penaltyRate: number;

  @Column({ nullable: true, name: 'last_payment_date' })
  lastPaymentDate: Date;

  @Column({ nullable: true, name: 'next_payment_date' })
  nextPaymentDate: Date;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'payment_method' })
  paymentMethod: string;

  @Column({ type: 'json', nullable: true, name: 'payment_schedule' })
  paymentSchedule: {
    frequency: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    amount: number;
    nextPaymentDate: Date;
    remainingPayments?: number;
  };

  @Column({ type: 'json', nullable: true, name: 'additional_info' })
  additionalInfo: {
    accountNumber?: string;
    collateral?: string;
    guarantor?: string;
    penaltyRate?: number;
    gracePeriod?: number;
    loanOfficer?: string;
    contractNumber?: string;
    [key: string]: any;
  };

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;
} 