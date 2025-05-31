import { forwardRef, Module } from '@nestjs/common';
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
import { QuestionService } from './services/question.service';
import { QuestionTranslation } from './entities/question-translation.entity';
import { QuestionTranslationRepository } from './repositories/question-translation.repository';
import { QuestionCategory } from './entities/question-category.entity';
import { QuestionCategoryRepository } from './repositories/question-category.repository';
import { QuestionCategoryService } from './services/question-category.service';
import { AdminQuestionController } from './controllers/admin/question.controller';
import { AdminQuestionCategoryController } from './controllers/admin/question-category.controller';
import { PublicQuestionController } from './controllers/public/question.controller';
import { PublicAssessmentController } from './controllers/public/assessment.controller';
import { PortfolioManagementModule } from '../portfolio-management/portfolio-management.module';
import { OptionalJwtGuard } from '../auth/guards/optional-jwt.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [AssessmentResult, Question, QuestionCategory, QuestionTranslation],
      MysqldbConnection.name,
    ),
    forwardRef(() => UserModule),
    LoggerModule,
    PortfolioManagementModule,
  ],
  controllers: [
    AdminQuestionCategoryController,
    AdminQuestionController,
    PublicQuestionController,
    PublicAssessmentController,
  ],
  providers: [
    RiskAssessmentService,
    QuestionService,
    QuestionCategoryService,
    QuestionRepository,
    QuestionTranslationRepository,
    QuestionCategoryRepository,
    AssessmentResultRepository,
    JwtService,
    OptionalJwtGuard,
  ],
  exports: [RiskAssessmentService],
})
export class RiskAssessmentModule {}
