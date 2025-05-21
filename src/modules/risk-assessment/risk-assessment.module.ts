import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { AssessmentResult } from './entities/assessment-result.entity';
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
import { QuestionService } from './services/question.service';
import { RiskProfileService } from './services/risk-profile.service';
import { AssetClassService } from './services/asset-class.service';
import { AssetAllocationService } from './services/asset-allocation.service';
import { QuestionTranslation } from './entities/question-translation.entity';
import { QuestionTranslationRepository } from './repositories/question-translation.repository';
import { QuestionCategory } from './entities/question-category.entity';
import { QuestionCategoryRepository } from './repositories/question-category.repository';
import { QuestionCategoryService } from './services/question-category.service';
import { AdminQuestionController } from './controllers/admin/question.controller';
import { AdminQuestionCategoryController } from './controllers/admin/question-category.controller';
import { AdminRiskProfileController } from './controllers/admin/risk-profile.controller';
import { AdminAssetClassController } from './controllers/admin/asset-class.controller';
import { AdminAssetAllocationController } from './controllers/admin/asset-allocation.controller';
import { PublicQuestionController } from './controllers/public/question.controller';
import { PublicAssessmentController } from './controllers/public/assessment.controller';
import { RiskProfileTranslation } from './entities/risk-profile-translation.entity';
import { RiskProfileTranslationRepository } from './repositories/risk-profile-translation.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Question,
      QuestionTranslation,
      QuestionCategory,
      AssessmentResult,
      RiskProfile,
      AssetClass,
      AssetAllocation,
      RiskProfileTranslation,
    ], MysqldbConnection.name),
    UserModule,
    LoggerModule
  ],
  controllers: [
    AdminQuestionController,
    AdminQuestionCategoryController,
    AdminRiskProfileController,
    AdminAssetClassController,
    AdminAssetAllocationController,
    PublicQuestionController,
    PublicAssessmentController
  ],
  providers: [
    RiskAssessmentService,
    QuestionService,
    QuestionCategoryService,
    RiskProfileService,
    AssetClassService,
    AssetAllocationService,
    QuestionRepository,
    QuestionTranslationRepository,
    QuestionCategoryRepository,
    AssessmentResultRepository,
    JwtService,
    AssetClassRepository,
    AssetAllocationRepository,
    RiskProfileRepository,
    RiskProfileTranslationRepository
  ],
  exports: [RiskAssessmentService],
})
export class RiskAssessmentModule {} 