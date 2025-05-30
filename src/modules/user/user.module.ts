import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from './repositories/user.repository';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '@/shared/logger/logger.module';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { UserDetail } from './entities/user-detail.entity';
import { UserDetailRepository } from './repositories/user-detail.repository';
import { UserOtp } from './entities/user-otp.entity';
import { UserAuth } from './entities/user-auth.entity';
import { UserOtpRepository } from './repositories/user-otp.repository';
import { UserAuthRepository } from './repositories/user-auth.repository';
import { AssetManagementModule } from '@/modules/asset-management/asset-management.module';
import { DebtManagementModule } from '@/modules/debt-management/debt-management.module';
import { NetWorthModule } from '@/modules/net-worth/net-worth.module';
import { FinancialAnalysisModule } from '@/modules/financial-analysis/financial-analysis.module';
import { GeminiModule } from '@/shared/gemini/gemini.module';
import { RiskAssessmentModule } from '../risk-assessment/risk-assessment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [User, UserDetail, UserOtp, UserAuth],
      MysqldbConnection.name),
    LoggerModule,
    AssetManagementModule,
    DebtManagementModule,
    NetWorthModule,
    forwardRef(() => FinancialAnalysisModule),
    GeminiModule,
    forwardRef(() => RiskAssessmentModule),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    JwtService,
    UserRepository,
    UserDetailRepository,
    UserOtpRepository,
    UserAuthRepository,
  ],
  exports: [UserService, UserOtpRepository, UserAuthRepository, UserRepository],
})
export class UserModule { }
