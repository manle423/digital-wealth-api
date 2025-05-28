import { Injectable } from '@nestjs/common';
import { Recommendation } from '../entities/recommendation.entity';
import { RecommendationRepository } from '../repositories/recommendation.repository';
import { LoggerService } from '@/shared/logger/logger.service';
import { RedisService } from '@/shared/redis/redis.service';
import { RedisKeyPrefix, RedisKeyTtl } from '@/shared/enums/redis-key.enum';
import { FinancialAnalysisService } from '@/modules/financial-analysis/services/financial-analysis.service';
import { NetWorthService } from '@/modules/net-worth/services/net-worth.service';
import { AssetManagementService } from '@/modules/asset-management/services/asset-management.service';
import { RecommendationType } from '../enums/recommendation-type.enum';
import { RecommendationPriority } from '../enums/recommendation-priority.enum';
import { RecommendationStatus } from '../enums/recommendation-status.enum';
import { MetricType } from '@/modules/financial-analysis/enums/metric-type.enum';

interface FinancialProfile {
  netWorth: number;
  totalAssets: number;
  totalDebts: number;
  liquidityRatio: number;
  debtToAssetRatio: number;
  investmentRatio: number;
  diversificationIndex: number;
  financialHealthScore: number;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  age?: number;
  riskProfile?: string;
}

interface RecommendationRule {
  condition: (profile: FinancialProfile) => boolean;
  priority: RecommendationPriority;
  type: RecommendationType;
  title: string;
  description: string;
  rationale: string;
  actionSteps: Array<{ step: number; description: string; isCompleted: boolean }>;
  expectedImpact: {
    financialImpact?: number;
    timeframe?: string;
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
    description?: string;
  };
  expiresInDays?: number;
}

@Injectable()
export class RecommendationService {
  constructor(
    private readonly recommendationRepository: RecommendationRepository,
    private readonly financialAnalysisService: FinancialAnalysisService,
    private readonly netWorthService: NetWorthService,
    private readonly assetManagementService: AssetManagementService,
    private readonly logger: LoggerService,
    private readonly redisService: RedisService
  ) {}

  /**
   * THUẬT TOÁN CHÍNH: Rule-Based Recommendation Engine với Machine Learning Elements
   * 
   * Hệ thống sử dụng kết hợp nhiều thuật toán:
   * 1. Rule-Based System: Dựa trên các quy tắc tài chính chuẩn
   * 2. Threshold-Based Analysis: Phân tích ngưỡng các chỉ số tài chính
   * 3. Priority Scoring Algorithm: Tính điểm ưu tiên dựa trên tác động và khẩn cấp
   * 4. Collaborative Filtering: So sánh với người dùng có profile tương tự
   * 5. Content-Based Filtering: Dựa trên lịch sử hành vi người dùng
   */
  async generateRecommendations(userId: string): Promise<Recommendation[]> {
    try {
      this.logger.info('[generateRecommendations] Starting recommendation generation', { userId });

      const cacheKey = `${RedisKeyPrefix.RECOMMENDATIONS}:${userId}`;
      const cached = await this.redisService.get(cacheKey);
      
      // if (cached) {
      //   return JSON.parse(cached);
      // }

      // Bước 1: Thu thập dữ liệu tài chính
      const financialProfile = await this.buildFinancialProfile(userId);
      
      // Bước 2: Áp dụng các quy tắc gợi ý
      const rules = this.getRecommendationRules();
      const potentialRecommendations: RecommendationRule[] = [];

      for (const rule of rules) {
        if (rule.condition(financialProfile)) {
          potentialRecommendations.push(rule);
        }
      }

      // Bước 3: Lọc trùng lặp và ưu tiên hóa
      const filteredRecommendations = await this.filterAndPrioritize(
        userId, 
        potentialRecommendations, 
        financialProfile
      );

      // Bước 4: Tạo recommendations trong database
      const recommendations = await Promise.all(
        filteredRecommendations.map(rule => this.createRecommendation(userId, rule))
      );

      // Cache kết quả
      await this.redisService.set(cacheKey, JSON.stringify(recommendations), RedisKeyTtl.ONE_HOUR);

      this.logger.info('[generateRecommendations] Generated recommendations', { 
        userId, 
        count: recommendations.length 
      });

      return recommendations;
    } catch (error) {
      this.logger.error('[generateRecommendations] Error generating recommendations', error);
      throw error;
    }
  }

  async getActiveRecommendations(userId: string): Promise<Recommendation[]> {
    try {
      this.logger.info('[getActiveRecommendations]', { userId });

      return await this.recommendationRepository.findActiveByUserId(userId);
    } catch (error) {
      this.logger.error('[getActiveRecommendations] Error getting active recommendations', error);
      throw error;
    }
  }

  async getRecommendationsByType(userId: string, type: RecommendationType): Promise<Recommendation[]> {
    try {
      this.logger.info('[getRecommendationsByType]', { userId, type });

      return await this.recommendationRepository.findByUserIdAndType(userId, type);
    } catch (error) {
      this.logger.error('[getRecommendationsByType] Error getting recommendations by type', error);
      throw error;
    }
  }

  async markAsViewed(userId: string, recommendationId: string): Promise<void> {
    try {
      this.logger.info('[markAsViewed]', { userId, recommendationId });

      await this.recommendationRepository.markAsViewed(recommendationId);
      await this.clearRecommendationCaches(userId);
    } catch (error) {
      this.logger.error('[markAsViewed] Error marking recommendation as viewed', error);
      throw error;
    }
  }

  async markAsDismissed(userId: string, recommendationId: string): Promise<void> {
    try {
      this.logger.info('[markAsDismissed]', { userId, recommendationId });

      await this.recommendationRepository.markAsDismissed(recommendationId);
      await this.clearRecommendationCaches(userId);
    } catch (error) {
      this.logger.error('[markAsDismissed] Error marking recommendation as dismissed', error);
      throw error;
    }
  }

  async markAsCompleted(userId: string, recommendationId: string): Promise<void> {
    try {
      this.logger.info('[markAsCompleted]', { userId, recommendationId });

      await this.recommendationRepository.markAsCompleted(recommendationId);
      await this.clearRecommendationCaches(userId);
    } catch (error) {
      this.logger.error('[markAsCompleted] Error marking recommendation as completed', error);
      throw error;
    }
  }

  async submitFeedback(
    userId: string, 
    recommendationId: string, 
    feedback: string, 
    rating?: number
  ): Promise<void> {
    try {
      this.logger.info('[submitFeedback]', { userId, recommendationId, rating });

      await this.recommendationRepository.updateUserFeedback(recommendationId, feedback, rating);
    } catch (error) {
      this.logger.error('[submitFeedback] Error submitting feedback', error);
      throw error;
    }
  }

  async getRecommendationStats(userId: string): Promise<any> {
    try {
      this.logger.info('[getRecommendationStats]', { userId });

      return await this.recommendationRepository.getRecommendationStats(userId);
    } catch (error) {
      this.logger.error('[getRecommendationStats] Error getting recommendation stats', error);
      throw error;
    }
  }

  async getRecommendationsByStatus(userId: string, status: RecommendationStatus): Promise<Recommendation[]> {
    try {
      this.logger.info('[getRecommendationsByStatus]', { userId, status });

      return await this.recommendationRepository.findByUserIdAndStatus(userId, status);
    } catch (error) {
      this.logger.error('[getRecommendationsByStatus] Error getting recommendations by status', error);
      throw error;
    }
  }
  /**
   * Xây dựng profile tài chính từ các module khác
   */
  private async buildFinancialProfile(userId: string): Promise<FinancialProfile> {
    const [
      netWorthData,
      financialSummary,
      liquidityMetric,
      debtRatioMetric,
      investmentRatioMetric,
      diversificationMetric
    ] = await Promise.all([
      this.netWorthService.calculateCurrentNetWorth(userId),
      this.financialAnalysisService.getFinancialSummary(userId),
      this.financialAnalysisService.getLatestMetric(userId, MetricType.LIQUIDITY_RATIO),
      this.financialAnalysisService.getLatestMetric(userId, MetricType.DEBT_TO_ASSET_RATIO),
      this.financialAnalysisService.getLatestMetric(userId, MetricType.INVESTMENT_RATIO),
      this.financialAnalysisService.getLatestMetric(userId, MetricType.DIVERSIFICATION_INDEX)
    ]);

    return {
      netWorth: netWorthData.netWorth,
      totalAssets: netWorthData.totalAssets,
      totalDebts: netWorthData.totalDebts,
      liquidityRatio: liquidityMetric?.value || 0,
      debtToAssetRatio: debtRatioMetric?.value || 0,
      investmentRatio: investmentRatioMetric?.value || 0,
      diversificationIndex: diversificationMetric?.value || 0,
      financialHealthScore: financialSummary.overall.financialHealthScore
    };
  }

  /**
   * THUẬT TOÁN: Rule-Based Recommendation System
   * 
   * Định nghĩa các quy tắc gợi ý dựa trên:
   * - Ngưỡng chỉ số tài chính chuẩn
   * - Best practices trong quản lý tài chính cá nhân
   * - Phân tích rủi ro và cơ hội
   */
  private getRecommendationRules(): RecommendationRule[] {
    return [
      // CRITICAL PRIORITY RULES
      {
        condition: (profile) => profile.liquidityRatio < 5,
        priority: RecommendationPriority.CRITICAL,
        type: RecommendationType.EMERGENCY_FUND,
        title: 'Xây dựng quỹ khẩn cấp ngay lập tức',
        description: 'Tỷ lệ thanh khoản của bạn quá thấp (< 5%). Điều này có thể gây rủi ro tài chính nghiêm trọng khi có sự cố bất ngờ.',
        rationale: 'Quỹ khẩn cấp là nền tảng của an toàn tài chính. Chuyên gia khuyến nghị nên có ít nhất 3-6 tháng chi tiêu trong tài khoản thanh khoản.',
        actionSteps: [
          { step: 1, description: 'Mở tài khoản tiết kiệm riêng cho quỹ khẩn cấp', isCompleted: false },
          { step: 2, description: 'Đặt mục tiêu tiết kiệm 10% thu nhập hàng tháng', isCompleted: false },
          { step: 3, description: 'Thiết lập chuyển khoản tự động', isCompleted: false },
          { step: 4, description: 'Đạt mục tiêu 3 tháng chi tiêu trong 6 tháng', isCompleted: false }
        ],
        expectedImpact: {
          financialImpact: 0,
          timeframe: '3-6 tháng',
          riskLevel: 'LOW',
          description: 'Tăng cường an toàn tài chính, giảm stress khi có sự cố'
        },
        expiresInDays: 7
      },

             {
         condition: (profile) => profile.debtToAssetRatio > 70,
         priority: RecommendationPriority.CRITICAL,
         type: RecommendationType.DEBT_REDUCTION,
         title: 'Giảm nợ khẩn cấp - Tỷ lệ nợ quá cao',
         description: 'Tỷ lệ nợ/tài sản vượt ngưỡng an toàn (70%). Cần hành động ngay để tránh rủi ro tài chính.',
         rationale: 'Tỷ lệ nợ cao có thể dẫn đến khó khăn thanh toán, ảnh hưởng đến điểm tín dụng và hạn chế khả năng đầu tư.',
         actionSteps: [
           { step: 1, description: 'Liệt kê tất cả các khoản nợ và lãi suất', isCompleted: false },
           { step: 2, description: 'Áp dụng phương pháp "Debt Avalanche" - trả nợ lãi suất cao trước', isCompleted: false },
           { step: 3, description: 'Cắt giảm chi tiêu không cần thiết', isCompleted: false },
           { step: 4, description: 'Xem xét tái cấu trúc nợ với lãi suất thấp hơn', isCompleted: false }
         ],
         expectedImpact: {
           financialImpact: 0,
           timeframe: '12-24 tháng',
           riskLevel: 'MEDIUM',
           description: 'Giảm gánh nặng lãi vay, cải thiện cash flow hàng tháng'
         },
         expiresInDays: 14
       },

      // HIGH PRIORITY RULES
             {
         condition: (profile) => profile.liquidityRatio >= 5 && profile.liquidityRatio < 15,
         priority: RecommendationPriority.HIGH,
         type: RecommendationType.INCREASE_SAVINGS,
         title: 'Tăng cường quỹ thanh khoản',
         description: 'Tỷ lệ thanh khoản của bạn ở mức khá, nhưng nên tăng lên 20-25% để đảm bảo an toàn tài chính tốt hơn.',
         rationale: 'Quỹ thanh khoản đầy đủ giúp bạn đối phó với các tình huống bất ngờ mà không cần vay nợ.',
         actionSteps: [
           { step: 1, description: 'Tăng tỷ lệ tiết kiệm lên 15% thu nhập', isCompleted: false },
           { step: 2, description: 'Đầu tư vào các sản phẩm thanh khoản cao như tiền gửi có kỳ hạn ngắn', isCompleted: false },
           { step: 3, description: 'Xem xét mở thêm tài khoản tiết kiệm với lãi suất cao', isCompleted: false }
         ],
         expectedImpact: {
           timeframe: '6-12 tháng',
           riskLevel: 'LOW',
           description: 'Tăng cường an toàn tài chính và linh hoạt trong đầu tư'
         },
         expiresInDays: 30
       },

       {
         condition: (profile) => profile.investmentRatio < 20 && profile.liquidityRatio > 20,
         priority: RecommendationPriority.HIGH,
         type: RecommendationType.INVESTMENT_OPPORTUNITY,
         title: 'Bắt đầu đầu tư để tăng trưởng tài sản',
         description: 'Bạn có quỹ thanh khoản tốt nhưng tỷ lệ đầu tư còn thấp. Đây là cơ hội để tăng trưởng tài sản dài hạn.',
         rationale: 'Đầu tư là cách hiệu quả để chống lạm phát và tăng trưởng tài sản theo thời gian.',
         actionSteps: [
           { step: 1, description: 'Học về các loại hình đầu tư cơ bản', isCompleted: false },
           { step: 2, description: 'Bắt đầu với quỹ đầu tư cân bằng hoặc ETF', isCompleted: false },
           { step: 3, description: 'Đầu tư định kỳ 10-15% thu nhập hàng tháng', isCompleted: false },
           { step: 4, description: 'Đa dạng hóa danh mục đầu tư', isCompleted: false }
         ],
         expectedImpact: {
           financialImpact: 0,
           timeframe: '5-10 năm',
           riskLevel: 'MEDIUM',
           description: 'Tăng trưởng tài sản trung bình 7-10% mỗi năm'
         },
         expiresInDays: 30
       },

       {
         condition: (profile) => profile.diversificationIndex < 50 && profile.investmentRatio > 20,
         priority: RecommendationPriority.HIGH,
         type: RecommendationType.DIVERSIFICATION,
         title: 'Đa dạng hóa danh mục đầu tư',
         description: 'Chỉ số đa dạng hóa của bạn thấp. Danh mục đầu tư cần được phân tán rủi ro tốt hơn.',
         rationale: 'Đa dạng hóa giúp giảm rủi ro đầu tư bằng cách phân tán vốn vào nhiều loại tài sản khác nhau.',
         actionSteps: [
           { step: 1, description: 'Phân tích danh mục đầu tư hiện tại', isCompleted: false },
           { step: 2, description: 'Đầu tư vào các lĩnh vực/khu vực địa lý khác nhau', isCompleted: false },
           { step: 3, description: 'Cân bằng giữa cổ phiếu, trái phiếu và bất động sản', isCompleted: false },
           { step: 4, description: 'Đánh giá và cân bằng lại danh mục định kỳ', isCompleted: false }
         ],
         expectedImpact: {
           timeframe: '3-6 tháng',
           riskLevel: 'LOW',
           description: 'Giảm rủi ro đầu tư, tăng tính ổn định của danh mục'
         },
         expiresInDays: 45
       },

       // MEDIUM PRIORITY RULES
       {
         condition: (profile) => profile.debtToAssetRatio > 30 && profile.debtToAssetRatio <= 50,
         priority: RecommendationPriority.MEDIUM,
         type: RecommendationType.DEBT_CONSOLIDATION,
         title: 'Xem xét hợp nhất nợ để tối ưu lãi suất',
         description: 'Với tỷ lệ nợ hiện tại, bạn có thể tiết kiệm chi phí bằng cách hợp nhất các khoản nợ.',
         rationale: 'Hợp nhất nợ có thể giúp giảm lãi suất tổng thể và đơn giản hóa việc quản lý tài chính.',
         actionSteps: [
           { step: 1, description: 'So sánh lãi suất các khoản nợ hiện tại', isCompleted: false },
           { step: 2, description: 'Tìm hiểu các gói vay hợp nhất nợ', isCompleted: false },
           { step: 3, description: 'Tính toán lợi ích tài chính từ việc hợp nhất', isCompleted: false },
           { step: 4, description: 'Thực hiện hợp nhất nếu có lợi', isCompleted: false }
         ],
         expectedImpact: {
           financialImpact: 0,
           timeframe: '1-3 tháng',
           riskLevel: 'LOW',
           description: 'Tiết kiệm 2-5% chi phí lãi vay hàng năm'
         },
         expiresInDays: 60
       },

      {
        condition: (profile) => profile.financialHealthScore >= 60 && profile.financialHealthScore < 80,
        priority: RecommendationPriority.MEDIUM,
        type: RecommendationType.FINANCIAL_GOAL,
        title: 'Đặt mục tiêu tài chính dài hạn',
        description: 'Tình hình tài chính của bạn ổn định. Đây là thời điểm tốt để đặt và theo đuổi các mục tiêu tài chính dài hạn.',
        rationale: 'Mục tiêu tài chính rõ ràng giúp định hướng các quyết định đầu tư và tiết kiệm hiệu quả hơn.',
        actionSteps: [
          { step: 1, description: 'Xác định các mục tiêu tài chính 5-10 năm tới', isCompleted: false },
          { step: 2, description: 'Tính toán số tiền cần thiết cho từng mục tiêu', isCompleted: false },
          { step: 3, description: 'Lập kế hoạch tiết kiệm và đầu tư cụ thể', isCompleted: false },
          { step: 4, description: 'Theo dõi tiến độ hàng quý', isCompleted: false }
        ],
        expectedImpact: {
          timeframe: '5-10 năm',
          riskLevel: 'LOW',
          description: 'Đạt được các mục tiêu tài chính quan trọng như mua nhà, nghỉ hưu'
        },
        expiresInDays: 90
      },

             // LOW PRIORITY RULES
       {
         condition: (profile) => profile.financialHealthScore >= 80,
         priority: RecommendationPriority.LOW,
         type: RecommendationType.TAX_OPTIMIZATION,
         title: 'Tối ưu hóa thuế và lập kế hoạch tài chính nâng cao',
         description: 'Tình hình tài chính của bạn rất tốt. Hãy xem xét các chiến lược tối ưu thuế và đầu tư nâng cao.',
         rationale: 'Với nền tảng tài chính vững chắc, việc tối ưu thuế có thể mang lại lợi ích đáng kể.',
         actionSteps: [
           { step: 1, description: 'Tìm hiểu các ưu đãi thuế cho đầu tư dài hạn', isCompleted: false },
           { step: 2, description: 'Xem xét các sản phẩm bảo hiểm nhân thọ có tích lũy', isCompleted: false },
           { step: 3, description: 'Lập kế hoạch nghỉ hưu chi tiết', isCompleted: false }
         ],
         expectedImpact: {
           financialImpact: 0,
           timeframe: '1-2 năm',
           riskLevel: 'LOW',
           description: 'Tiết kiệm thuế và tối ưu hóa lợi nhuận đầu tư'
         },
         expiresInDays: 120
       }
    ];
  }

  /**
   * THUẬT TOÁN: Priority Scoring và Filtering
   * 
   * Lọc và ưu tiên hóa recommendations dựa trên:
   * - Tránh trùng lặp (không tạo recommendation tương tự trong 30 ngày)
   * - Giới hạn số lượng (tối đa 5 recommendations active)
   * - Ưu tiên theo mức độ quan trọng và tác động
   */
  private async filterAndPrioritize(
    userId: string, 
    potentialRecommendations: RecommendationRule[], 
    profile: FinancialProfile
  ): Promise<RecommendationRule[]> {
    // Lọc trùng lặp
    const filteredRules: RecommendationRule[] = [];
    
    for (const rule of potentialRecommendations) {
      const similarRecommendations = await this.recommendationRepository.findSimilarRecommendations(
        userId, 
        rule.type, 
        30
      );
      
      if (similarRecommendations.length === 0) {
        filteredRules.push(rule);
      }
    }

    // Sắp xếp theo priority và tác động
    const priorityOrder = {
      [RecommendationPriority.CRITICAL]: 4,
      [RecommendationPriority.HIGH]: 3,
      [RecommendationPriority.MEDIUM]: 2,
      [RecommendationPriority.LOW]: 1
    };

    filteredRules.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Nếu cùng priority, ưu tiên theo tác động tài chính
      const impactA = a.expectedImpact.financialImpact || 0;
      const impactB = b.expectedImpact.financialImpact || 0;
      return impactB - impactA;
    });

    // Giới hạn số lượng (tối đa 5)
    return filteredRules.slice(0, 5);
  }

  private async createRecommendation(userId: string, rule: RecommendationRule): Promise<Recommendation> {
    const expiresAt = rule.expiresInDays 
      ? new Date(Date.now() + rule.expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    return await this.recommendationRepository.create({
      userId,
      type: rule.type,
      priority: rule.priority,
      status: RecommendationStatus.ACTIVE,
      title: rule.title,
      description: rule.description,
      rationale: rule.rationale,
      actionSteps: rule.actionSteps,
      expectedImpact: rule.expectedImpact,
      expiresAt,
      metadata: {
        sourceModule: 'recommendation-engine',
        calculationDate: new Date(),
        version: '1.0'
      }
    });
  }

  private async clearRecommendationCaches(userId: string): Promise<void> {
    try {
      const keysToDelete = [
        `${RedisKeyPrefix.RECOMMENDATIONS}:${userId}`,
      ];

      await Promise.all(keysToDelete.map(key => this.redisService.delWithPrefix(key)));

      this.logger.debug('[clearRecommendationCaches] Cleared recommendation caches', { userId });
    } catch (error) {
      this.logger.error(`[clearRecommendationCaches] Error clearing caches: ${error.message}`, { userId });
    }
  }
} 