import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { AssessmentResult } from './entities/assessment-result.entity';
import { RiskAssessmentController } from './controllers/risk-assessment.controller';
import { RiskAssessmentService } from './risk-assessment.service';
import { UserModule } from '../user/user.module';
import { LoggerModule } from '@/shared/logger/logger.module';
import { QuestionRepository } from './repositories/question.repository';
import { AssessmentResultRepository } from './repositories/assessment-result.repository';
import { JwtService } from '@nestjs/jwt';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { AssetClass } from './entities/asset-class.entity';
import { AssetAllocation } from './entities/asset-allocation.entity';
import { RiskProfile } from './entities/risk-profile.entity';
import { AssetClassRepository } from './repositories/asset-class.repository';
import { AssetAllocationRepository } from './repositories/asset-allocation.repository';
import { RiskProfileRepository } from './repositories/risk-profile.repository';
import { RiskAssessmentAdminController } from './controllers/risk-assessment-admin.controller';
import { QuestionService } from './services/question.service';
import { RiskProfileService } from './services/risk-profile.service';
import { AssetClassService } from './services/asset-class.service';
import { AssetAllocationService } from './services/asset-allocation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Question,
      AssessmentResult,
      RiskProfile,
      AssetClass,
      AssetAllocation
    ], MysqldbConnection.name),
    UserModule,
    LoggerModule
  ],
  controllers: [
    RiskAssessmentController,
    RiskAssessmentAdminController
  ],
  providers: [
    RiskAssessmentService,
    QuestionService,
    RiskProfileService,
    AssetClassService,
    AssetAllocationService,
    QuestionRepository,
    AssessmentResultRepository,
    JwtService,
    AssetClassRepository,
    AssetAllocationRepository,
    RiskProfileRepository
  ],
  exports: [RiskAssessmentService],
})
export class RiskAssessmentModule {} 