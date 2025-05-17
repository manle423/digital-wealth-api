import { BaseEntity } from '@/shared/mysqldb/types/base-entity.type';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('user_details')
export class UserDetail extends BaseEntity {
  @OneToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ referencedColumnName: 'id' })
  user: User;

  @Column({ type: 'uuid', nullable: true, name: 'user_id' })
  userId: string;

  @Column({ nullable: true, name: 'date_of_birth' })
  dateOfBirth: Date;

  @Column({ nullable: true, name: 'phone_number' })
  phoneNumber: string;

  @Column({ nullable: true })
  occupation: string;

  @Column({ nullable: true, name: 'annual_income' })
  annualIncome: number;

  @Column({ nullable: true, name: 'investment_experience' })
  investmentExperience: string;

  @Column({ type: 'int', nullable: true, name: 'risk_tolerance' })
  riskTolerance: number;

  @Column({ type: 'json', nullable: true, name: 'investment_preferences' })
  investmentPreferences: {
    investmentGoals?: string[];
    preferredInvestmentTypes?: string[];
    timeHorizon?: string;
    monthlyExpenses?: number;
  };

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'total_portfolio_value' })
  totalPortfolioValue: number;

  @Column({ default: false, name: 'is_verified' })
  isVerified: boolean;

  @Column({ type: 'json', nullable: true, name: 'kyc_details' })
  kycDetails: {
    status: string;
    documents: string[];
    verificationDate: Date;
  };
}
