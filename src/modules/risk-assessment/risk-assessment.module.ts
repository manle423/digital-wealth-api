import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { AssessmentResult } from './entities/assessment-result.entity';
import { RiskAssessmentController } from './risk-assessment.controller';
import { RiskAssessmentService } from './risk-assessment.service';
import { UserModule } from '../user/user.module';
import { QuestionRepository } from './repositories/question.repository';
import { AssessmentResultRepository } from './repositories/assessment-result.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, AssessmentResult]),
    UserModule
  ],
  controllers: [RiskAssessmentController],
  providers: [
    RiskAssessmentService,
    QuestionRepository,
    AssessmentResultRepository
  ],
  exports: [RiskAssessmentService],
})
export class RiskAssessmentModule {} 