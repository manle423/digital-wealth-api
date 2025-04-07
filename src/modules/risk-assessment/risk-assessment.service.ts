import { Injectable } from '@nestjs/common';
import { Question } from './entities/question.entity';
import { AssessmentResult } from './entities/assessment-result.entity';
import { CreateAssessmentResultDto } from './dto/create-assessment-result.dto';
import { UserService } from '../user/user.service';
import { QuestionRepository } from './repositories/question.repository';
import { AssessmentResultRepository } from './repositories/assessment-result.repository';
import { RiskProfileType } from './enums/risk-profile.enum';
import { CreateQuestionDto } from './dto/create-question.dto';
import { GetQuestionsDto } from './dto/get-questions.dto';
import { PgPagination } from '@/shared/mysqldb/types/pagination.type';
import { QuestionUpdate } from './dto/update-multiple-questions.dto';

@Injectable()
export class RiskAssessmentService {
  constructor(
    private readonly questionRepository: QuestionRepository,
    private readonly assessmentResultRepository: AssessmentResultRepository,
    private readonly userService: UserService,
  ) {}

  async getQuestions(query?: GetQuestionsDto): Promise<{ data: Question[], pagination?: PgPagination }> {
    let pagination = null;
    
    if (query?.page && query?.limit) {
      pagination = new PgPagination(query.page, query.limit);
    }
    
    const questions = await this.questionRepository.findAllQuestions(query, pagination);
    
    if (!(questions && questions.length)) {
      return { data: [], pagination };
    }
    
    if (pagination) {
      pagination.totalItems = questions[1];
    }
    
    const result = {
      data: questions[0],
      pagination,
    };
    
    return result;
  }

  async saveAssessmentResult(
    createAssessmentResultDto: CreateAssessmentResultDto,
  ): Promise<AssessmentResult> {
    const { userId, totalScore, userResponses } = createAssessmentResultDto;
    
    // Determine risk profile based on score
    const riskProfile = this.calculateRiskProfile(totalScore);
    
    // Generate recommended allocation
    const recommendedAllocation = this.generateRecommendedAllocation(riskProfile);
    
    // Generate summary
    const summary = this.generateSummary(riskProfile, recommendedAllocation);
    
    // Create assessment result
    const assessmentResultData = {
      userId,
      totalScore,
      riskProfile,
      userResponses,
      recommendedAllocation,
      summary,
    };
    
    const savedResults = await this.assessmentResultRepository.save(assessmentResultData);
    return savedResults[0] as AssessmentResult;
  }

  calculateRiskProfile(totalScore: number): RiskProfileType {
    if (totalScore <= 20) {
      return RiskProfileType.CONSERVATIVE;
    } else if (totalScore <= 40) {
      return RiskProfileType.MODERATELY_CONSERVATIVE;
    } else if (totalScore <= 60) {
      return RiskProfileType.MODERATE;
    } else if (totalScore <= 80) {
      return RiskProfileType.MODERATELY_AGGRESSIVE;
    } else {
      return RiskProfileType.AGGRESSIVE;
    }
  }

  generateRecommendedAllocation(riskProfile: RiskProfileType): { assetClass: string; percentage: number }[] {
    switch (riskProfile) {
      case RiskProfileType.CONSERVATIVE:
        return [
          { assetClass: 'Cash and Equivalents', percentage: 20 },
          { assetClass: 'Bonds', percentage: 60 },
          { assetClass: 'Stocks', percentage: 15 },
          { assetClass: 'Alternative Investments', percentage: 5 },
        ];
      case RiskProfileType.MODERATELY_CONSERVATIVE:
        return [
          { assetClass: 'Cash and Equivalents', percentage: 15 },
          { assetClass: 'Bonds', percentage: 50 },
          { assetClass: 'Stocks', percentage: 30 },
          { assetClass: 'Alternative Investments', percentage: 5 },
        ];
      case RiskProfileType.MODERATE:
        return [
          { assetClass: 'Cash and Equivalents', percentage: 10 },
          { assetClass: 'Bonds', percentage: 40 },
          { assetClass: 'Stocks', percentage: 40 },
          { assetClass: 'Alternative Investments', percentage: 10 },
        ];
      case RiskProfileType.MODERATELY_AGGRESSIVE:
        return [
          { assetClass: 'Cash and Equivalents', percentage: 5 },
          { assetClass: 'Bonds', percentage: 25 },
          { assetClass: 'Stocks', percentage: 55 },
          { assetClass: 'Alternative Investments', percentage: 15 },
        ];
      case RiskProfileType.AGGRESSIVE:
        return [
          { assetClass: 'Cash and Equivalents', percentage: 5 },
          { assetClass: 'Bonds', percentage: 15 },
          { assetClass: 'Stocks', percentage: 65 },
          { assetClass: 'Alternative Investments', percentage: 15 },
        ];
      default:
        return [
          { assetClass: 'Cash and Equivalents', percentage: 10 },
          { assetClass: 'Bonds', percentage: 40 },
          { assetClass: 'Stocks', percentage: 40 },
          { assetClass: 'Alternative Investments', percentage: 10 },
        ];
    }
  }

  generateSummary(
    riskProfile: RiskProfileType,
    allocation: { assetClass: string; percentage: number }[],
  ): string {
    const profiles = {
      [RiskProfileType.CONSERVATIVE]: 'Bạn có khẩu vị rủi ro thấp, ưu tiên bảo toàn vốn hơn là lợi nhuận cao. Chiến lược đầu tư của bạn nên tập trung vào các tài sản an toàn.',
      [RiskProfileType.MODERATELY_CONSERVATIVE]: 'Bạn có khẩu vị rủi ro thấp đến trung bình, chấp nhận một chút rủi ro để có được lợi nhuận tốt hơn.',
      [RiskProfileType.MODERATE]: 'Bạn có khẩu vị rủi ro trung bình, cân bằng giữa bảo toàn vốn và tăng trưởng.',
      [RiskProfileType.MODERATELY_AGGRESSIVE]: 'Bạn có khẩu vị rủi ro trung bình đến cao, sẵn sàng chấp nhận rủi ro lớn hơn để đạt được lợi nhuận cao hơn.',
      [RiskProfileType.AGGRESSIVE]: 'Bạn có khẩu vị rủi ro cao, ưu tiên tăng trưởng dài hạn và sẵn sàng chấp nhận biến động lớn trong ngắn hạn.',
    };

    return `${profiles[riskProfile]} Danh mục đầu tư đề xuất của bạn gồm ${allocation.map(item => `${item.percentage}% vào ${item.assetClass}`).join(', ')}.`;
  }

  async getUserAssessmentHistory(userId: string): Promise<AssessmentResult[]> {
    return this.assessmentResultRepository.find(
      { userId },
      { order: { createdAt: 'DESC' } }
    );
  }

  async getLatestAssessmentResult(userId: string): Promise<AssessmentResult> {
    const results = await this.assessmentResultRepository.find(
      { userId },
      { order: { createdAt: 'DESC' }, take: 1 }
    );
    return results[0];
  }

  async createQuestions(questionsData: CreateQuestionDto[]): Promise<Question[]> {
    const questions = questionsData.map(questionDto => ({
      ...questionDto,
      isActive: questionDto.isActive ?? true,
    }));
    
    return await this.questionRepository.save(questions) as Question[];
  }
  
  async updateQuestions(updates: QuestionUpdate[]): Promise<Question[]> {
    return this.questionRepository.updateMultipleQuestions(updates);
  }
  
  async deleteQuestions(ids: string[]): Promise<boolean> {
    return this.questionRepository.deleteMultipleQuestions(ids);
  }
} 