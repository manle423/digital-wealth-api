import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { AssessmentResult } from './entities/assessment-result.entity';
import { RiskAssessmentController } from './risk-assessment.controller';
import { RiskAssessmentService } from './risk-assessment.service';
import { UserModule } from '../user/user.module';
import { LoggerModule } from '@/shared/logger/logger.module';
import { QuestionRepository } from './repositories/question.repository';
import { AssessmentResultRepository } from './repositories/assessment-result.repository';
import { JwtService } from '@nestjs/jwt';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, AssessmentResult], MysqldbConnection.name),
    UserModule,
    LoggerModule
  ],
  controllers: [RiskAssessmentController],
  providers: [
    RiskAssessmentService,
    QuestionRepository,
    AssessmentResultRepository,
    JwtService
  ],
  exports: [RiskAssessmentService],
})
export class RiskAssessmentModule {} 