import { BaseEntity } from '@/shared/mysqldb/types/base-entity.type';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('user_details')
export class UserDetail extends BaseEntity {
  @OneToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ referencedColumnName: 'id' })
  user: User;

  @Column({ type: 'string', nullable: true })
  userId: string;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  occupation: string;

  @Column({ nullable: true })
  annualIncome: number;

  @Column({ nullable: true })
  investmentExperience: string;

  @Column({ type: 'int', nullable: true })
  riskTolerance: number; // Scale of 1-10

  @Column({ type: 'json', nullable: true })
  investmentPreferences: {
    investmentGoals: string[];
    preferredInvestmentTypes: string[];
    timeHorizon: string;
  };

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalPortfolioValue: number;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'json', nullable: true })
  kycDetails: {
    status: string;
    documents: string[];
    verificationDate: Date;
  };
}
