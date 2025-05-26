import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsDateString, IsObject, Min, Max, IsUUID } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { DebtType } from '../enums/debt-type.enum';
import { DebtStatus } from '../enums/debt-status.enum';

export class CreateDebtDto {
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(DebtType)
  @IsOptional()
  type?: DebtType;

  @IsEnum(DebtStatus)
  @IsOptional()
  status?: DebtStatus;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  originalAmount: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  currentBalance: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  interestRate?: number;

  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  dueDate?: Date;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  monthlyPayment?: number;

  @IsString()
  @IsOptional()
  creditor?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  termMonths?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  totalPaid?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  totalInterest?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  penaltyRate?: number;

  @IsDateString()
  @IsOptional()
  lastPaymentDate?: Date;

  @IsDateString()
  @IsOptional()
  nextPaymentDate?: Date;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsObject()
  @IsOptional()
  paymentSchedule?: {
    frequency: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    amount: number;
    nextPaymentDate: Date;
    remainingPayments?: number;
  };

  @IsObject()
  @IsOptional()
  additionalInfo?: {
    accountNumber?: string;
    collateral?: string;
    guarantor?: string;
    penaltyRate?: number;
    gracePeriod?: number;
    loanOfficer?: string;
    contractNumber?: string;
    [key: string]: any;
  };

  @IsString()
  @IsOptional()
  notes?: string;
} 