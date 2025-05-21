import { Injectable } from '@nestjs/common';
import { AssessmentResult } from './entities/assessment-result.entity';
import { CreateAssessmentResultDto } from './dto/create-assessment-result.dto';
import { AssessmentResultRepository } from './repositories/assessment-result.repository';
import { RiskProfileType } from './enums/risk-profile.enum';
import { RiskProfileRepository } from './repositories/risk-profile.repository';
import { AssetAllocationRepository } from './repositories/asset-allocation.repository';
import { Language } from '@/shared/enums/language.enum';

@Injectable()
export class RiskAssessmentService {
  constructor(
    private readonly assessmentResultRepository: AssessmentResultRepository,
    private readonly riskProfileRepository: RiskProfileRepository,
    private readonly assetAllocationRepository: AssetAllocationRepository,
  ) {}

  async saveAssessmentResult(
    createAssessmentResultDto: CreateAssessmentResultDto,
  ): Promise<AssessmentResult> {
    const { userId, totalScore, userResponses } = createAssessmentResultDto;
    
    // Lấy hồ sơ rủi ro dựa trên điểm từ cơ sở dữ liệu
    let riskProfile = await this.riskProfileRepository.findByScore(totalScore);
    let riskProfileType: RiskProfileType;
    
    // Fallback nếu không tìm thấy trong cơ sở dữ liệu
    if (!riskProfile) {
      riskProfileType = this.calculateRiskProfile(totalScore);
    } else {
      riskProfileType = riskProfile.type;
    }
    
    // Lấy phân bổ tài sản từ cơ sở dữ liệu nếu có
    let recommendedAllocation: { assetClass: string; percentage: number }[] = [];
    
    if (riskProfile) {
      const allocations = await this.assetAllocationRepository.findByRiskProfileId(riskProfile.id);
      if (allocations && allocations.length > 0) {
        recommendedAllocation = allocations.map(allocation => ({
          assetClass: allocation.assetClass.name,
          percentage: allocation.percentage
        }));
      }
    }
    
    // Fallback nếu không tìm thấy phân bổ trong cơ sở dữ liệu
    if (recommendedAllocation.length === 0) {
      recommendedAllocation = this.generateRecommendedAllocation(riskProfileType);
    }
    
    // Tạo nội dung tóm tắt
    let summary: string;
    if (riskProfile?.translations?.length > 0) {
      // Sử dụng mô tả từ database (lấy bản dịch tiếng Việt)
      const viTranslation = riskProfile.translations.find(t => t.language === Language.VI);
      if (viTranslation) {
        summary = `${viTranslation.description} Danh mục đầu tư đề xuất của bạn gồm ${recommendedAllocation.map(item => `${item.percentage}% vào ${item.assetClass}`).join(', ')}.`;
      } else {
        // Fallback sử dụng bản dịch đầu tiên nếu không có tiếng Việt
        summary = `${riskProfile.translations[0].description} Danh mục đầu tư đề xuất của bạn gồm ${recommendedAllocation.map(item => `${item.percentage}% vào ${item.assetClass}`).join(', ')}.`;
      }
    } else {
      // Fallback sử dụng phương thức cũ
      summary = this.generateSummary(riskProfileType, recommendedAllocation);
    }
    
    // Tạo kết quả đánh giá
    const assessmentResultData = {
      userId,
      totalScore,
      riskProfile: riskProfileType,
      userResponses,
      recommendedAllocation,
      summary,
    };
    
    const savedResults = await this.assessmentResultRepository.save(assessmentResultData);
    return savedResults[0] as AssessmentResult;
  }

  // Fallback methods - được sử dụng khi không có dữ liệu trong database
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
} 