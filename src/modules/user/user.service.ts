import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { hash } from 'bcrypt';
import { AuthError } from '@/modules/auth/enum/error.enum';
import { LoggerService } from '@/shared/logger/logger.service';
import { UserRepository } from './repositories/user.repository';
import { User } from './entities/user.entity';
import { FindOptionsWhere, DeepPartial } from 'typeorm';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UserDetailRepository } from './repositories/user-detail.repository';
import { UserDetail } from './entities/user-detail.entity';
import { RabbitmqService } from '@/shared/rabbitmq/rabbitmq.service';
import { IWelcomeEmailData } from '@/modules/task-queue/interfaces/notification.interface';
import { RoutingKey } from '@/shared/rabbitmq/constants';
import { RedisService } from '@/shared/redis/redis.service';
import { RedisKeyPrefix, RedisKeyTtl } from '@/shared/enums/redis-key.enum';
import { NetWorthService } from '@/modules/net-worth/services/net-worth.service';
import { FinancialAnalysisService } from '@/modules/financial-analysis/services/financial-analysis.service';
import { AssetManagementService } from '@/modules/asset-management/services/asset-management.service';
import { DebtManagementService } from '@/modules/debt-management/services/debt-management.service';
import { GeminiService } from '@/shared/gemini/gemini.service';
import { RiskAssessmentService } from '../risk-assessment/risk-assessment.service';

@Injectable()
export class UserService {
  constructor(
    private readonly logger: LoggerService,
    private readonly userRepository: UserRepository,
    private readonly userDetailRepository: UserDetailRepository,
    private readonly rabbitmqService: RabbitmqService,
    private readonly redisService: RedisService,
    private readonly netWorthService: NetWorthService,
    private readonly financialAnalysisService: FinancialAnalysisService,
    private readonly assetManagementService: AssetManagementService,
    private readonly debtManagementService: DebtManagementService,
    private readonly geminiService: GeminiService,
    private readonly riskAssessmentService: RiskAssessmentService,
  ) {}

  async createUser(dto: RegisterDto) {
    try {
      this.logger.info('[createUser]', { email: dto.email, name: dto.name });

      const whereOptions: FindOptionsWhere<User> = { email: dto.email };
      const existingUser = await this.userRepository.findOne(whereOptions, {
        select: ['id', 'email'],
      });

      if (existingUser) {
        throw new ConflictException(AuthError.EMAIL_ALREADY_EXISTS);
      }

      if (dto.password !== dto.confirmPassword) {
        throw new ConflictException(AuthError.PASSWORD_NOT_MATCH);
      }

      const { confirmPassword, ...userData } = dto;

      const hashedPassword = await hash(dto.password, 10);
      const savedUsers = await this.userRepository.save({
        ...userData,
        password: hashedPassword,
      });

      const savedUser = savedUsers[0];
      
      const welcomeEmailData: IWelcomeEmailData = {
        to: savedUser.email,
        name: savedUser.name,
        subject: 'Welcome to Digital Wealth',
        template: 'welcome',
        data: {
          name: savedUser.name,
          email: savedUser.email
        }
      };

      // Push welcome email message to queue
      await this.rabbitmqService.push(RoutingKey.sendWelcomeMail, welcomeEmailData);

      const { password, ...result } = savedUser;
      return result;
    } catch (error) {
      this.logger.error('[createUser] Error creating user', error);
      throw error;
    }
  }

  async findByEmail(email: string) {
    try {
      this.logger.info('[findByEmail]', { email });

      return await this.userRepository.findOne({
        email,
      });
    } catch (error) {
      this.logger.error('[findByEmail] Error finding user by email', error);
      throw error;
    }
  }

  async findById(id: string) {
    try {
      this.logger.info('[findById]', { userId: id });

      const user = await this.userRepository.findOne({
        id,
      });

      if (!user) {
        throw new NotFoundException(AuthError.USER_NOT_FOUND);
      }

      const { password, ...result } = user;
      return result;
    } catch (error) {
      this.logger.error('[findById] Error finding user by id', error);
      throw error;
    }
  }

  async updateUserProfile(userId: string, dto: UpdateUserProfileDto) {
    try {
      this.logger.info('[updateUserProfile]', { userId });

      // Check if user exists
      const user = await this.userRepository.findOne({ id: userId });

      if (!user) {
        throw new NotFoundException(AuthError.USER_NOT_FOUND);
      }

      // Update user name if provided
      if (dto.name) {
        await this.userRepository.update({ id: userId }, { name: dto.name });
      }

      // Update user detail if provided
      if (dto.userDetail) {
        const userDetail = await this.userDetailRepository.findOne({ userId });

        // Prepare user detail data
        const userDetailData = {
          ...dto.userDetail,
          // Ensure riskTolerance is a number
          riskTolerance: dto.userDetail.riskTolerance || 1,
          // Handle investment preferences
          investmentPreferences: typeof dto.userDetail.investmentPreferences === 'string' 
            ? { monthlyExpenses: Number(dto.userDetail.investmentPreferences) }
            : dto.userDetail.investmentPreferences || {}
        };

        // Remove any undefined values
        Object.keys(userDetailData).forEach(key => 
          userDetailData[key] === undefined && delete userDetailData[key]
        );

        if (!userDetail) {
          // Create new user detail
          await this.userDetailRepository.save({
            userId,
            ...userDetailData,
            riskTolerance: userDetailData.riskTolerance || 1 // Ensure default value
          } as DeepPartial<UserDetail>);
        } else {
          // Update existing user detail
          await this.userDetailRepository.update(
            { userId }, 
            {
              ...userDetailData,
              riskTolerance: userDetailData.riskTolerance || userDetail.riskTolerance || 1
            } as DeepPartial<UserDetail>
          );
        }
      }

      // Xóa cache
      await this.clearUserCache(userId, user.email);

      // Get updated user with detail
      const updatedUser = await this.userRepository.findOne(
        { id: userId },
        { relations: ['userDetail'] }
      );

      const { password, ...result } = updatedUser;
      return result;
    } catch (error) {
      this.logger.error('[updateUserProfile] Error updating user profile', error);
      throw error;
    }
  }

  // Helper method to convert risk tolerance string to number
  private convertRiskToleranceToNumber(riskTolerance: string): number {
    const riskToleranceMap = {
      'CONSERVATIVE': 1,
      'MODERATE': 2,
      'AGGRESSIVE': 3
    };
    return riskToleranceMap[riskTolerance] || 1;
  }

  async getUserProfileComplete(userId: string) {
    try {
      this.logger.info('[getUserProfileComplete]', { userId });

      // Kiểm tra cache
      const cacheKey = `${RedisKeyPrefix.USER_PROFILE}:${userId}`;
      const cachedProfile = await this.redisService.get(cacheKey);
      
      if (cachedProfile) {
        this.logger.debug(`Cache hit: ${cacheKey}`);
        return JSON.parse(cachedProfile);
      }

      // Nếu không có cache, truy vấn database
      const user = await this.userRepository.findOne(
        { id: userId },
        { relations: ['userDetail'] }
      );

      if (!user) {
        throw new NotFoundException(AuthError.USER_NOT_FOUND);
      }

      const { password, ...result } = user;
      
      // Lưu kết quả vào cache
      await this.redisService.set(
        cacheKey, 
        JSON.stringify(result), 
        RedisKeyTtl.ONE_HOUR
      );
      
      return result;
    } catch (error) {
      this.logger.error('[getUserProfileComplete] Error getting complete user profile', error);
      throw error;
    }
  }

  // Xóa tất cả cache liên quan đến một user
  private async clearUserCache(userId: string, email: string): Promise<void> {
    try {
      // Clear all user related caches
      const keysToDelete = [
        `${RedisKeyPrefix.USER_ID}:${userId}`,
        `${RedisKeyPrefix.USER_EMAIL}:${email}`,
        `${RedisKeyPrefix.USER_PROFILE}:${userId}`,
        `${RedisKeyPrefix.USER_DETAIL}:${userId}`,
        `${RedisKeyPrefix.NET_WORTH}:${userId}`,
        `${RedisKeyPrefix.FINANCIAL_METRICS}:${userId}`,
      ];

      await Promise.all(keysToDelete.map(key => this.redisService.del(key)));
      
      this.logger.debug('[clearUserCache] Cleared all user caches', { userId, email });
    } catch (error) {
      this.logger.error(`[clearUserCache] Error clearing user cache: ${error.message}`, { userId, email });
      // Không throw error để không ảnh hưởng đến luồng chính
    }
  }

  async updatePassword(userId: string, hashedPassword: string) {
    this.logger.info('[updatePassword]', { userId });
    return this.userRepository.update({id: userId}, { password: hashedPassword });
  }

  async getUserFinanceProfile(userId: string) {
    try {
      this.logger.info('[getUserFinanceProfile]', { userId });

      // Check cache first
      const cacheKey = `${RedisKeyPrefix.FINANCIAL_SUMMARY_BY_AI}:${userId}`;
      const cachedData = await this.redisService.get(cacheKey);
      
      if (cachedData) {
        this.logger.debug('[getUserFinanceProfile] Cache hit', { userId });
        return JSON.parse(cachedData);
      }

      this.logger.debug('[getUserFinanceProfile] Cache miss, fetching data', { userId });

      // Get user basic info and details
      const [user, userDetail] = await Promise.all([
        this.userRepository.findOne({ id: userId }),
        this.userDetailRepository.findOne({ userId })
      ]);

      if (!user) {
        throw new NotFoundException(AuthError.USER_NOT_FOUND);
      }

      const riskTolerance = await this.riskAssessmentService.getUserAssessmentHistory(userId);

      // Get financial data from all financial modules
      const [
        netWorthSummary,
        financialMetrics,
        assetBreakdown,
        debtBreakdown,
        liquidAssets
      ] = await Promise.all([
        this.netWorthService.getNetWorthSummary(userId).catch(() => ({
          current: { totalAssets: 0, totalDebts: 0, netWorth: 0, liquidAssets: 0 },
          trend: { change: 0, changePercentage: 0, trend: 'STABLE' as const },
          breakdown: { assets: [], debts: [] }
        })),
        this.financialAnalysisService.getFinancialSummary(userId).catch(() => ({
          overallScore: 0,
          metrics: []
        })),
        this.assetManagementService.getAssetBreakdown(userId).catch(() => []),
        this.debtManagementService.getDebtBreakdown(userId).catch(() => []),
        this.assetManagementService.getLiquidAssets(userId).catch(() => [])
      ]);

      // Calculate age from dateOfBirth
      const age = userDetail?.dateOfBirth 
        ? new Date().getFullYear() - new Date(userDetail.dateOfBirth).getFullYear()
        : null;

      // Calculate monthly income and expenses
      const monthlyIncome = userDetail?.annualIncome ? Math.round(userDetail.annualIncome / 12) : 0;
      const monthlyExpenses = userDetail?.investmentPreferences?.monthlyExpenses || 0;
      const monthlySavings = monthlyIncome - monthlyExpenses;

      // Prepare comprehensive financial data
      const financialProfile = {
        // User information
        user: {
          name: user.name,
          email: user.email,
          age: age,
          occupation: userDetail?.occupation || 'Chưa cập nhật',
          investmentExperience: userDetail?.investmentExperience || 'Mới bắt đầu',
        },

        riskAssessment: {
          history: riskTolerance,
          current: riskTolerance[riskTolerance.length - 1]
        },

        // Financial overview
        financial: {
          monthlyIncome: monthlyIncome,
          monthlyExpenses: monthlyExpenses,
          monthlySavings: monthlySavings,
          savingsRate: monthlyIncome > 0 ? Math.round((monthlySavings / monthlyIncome) * 100) : 0,
          totalAssets: netWorthSummary.current.totalAssets,
          totalDebts: netWorthSummary.current.totalDebts,
          netWorth: netWorthSummary.current.netWorth,
          liquidAssets: netWorthSummary.current.liquidAssets,
          emergencyFundMonths: monthlyExpenses > 0 ? Math.round(netWorthSummary.current.liquidAssets / monthlyExpenses) : 0
        },

        // Asset breakdown
        assets: {
          breakdown: assetBreakdown,
          liquid: liquidAssets.slice(0, 5).map(asset => ({
            name: asset.name,
            type: asset.type,
            value: asset.currentValue,
            category: asset.category?.name
          })),
          totalCategories: assetBreakdown.length
        },

        // Debt breakdown
        debts: {
          breakdown: debtBreakdown,
          totalCategories: debtBreakdown.length,
          debtToAssetRatio: netWorthSummary.current.totalAssets > 0 
            ? Math.round((netWorthSummary.current.totalDebts / netWorthSummary.current.totalAssets) * 100)
            : 0
        },

        // Financial health metrics
        healthMetrics: {
          overallScore: (financialMetrics as any)?.overall?.score || (financialMetrics as any)?.overallScore || 0,
          trend: netWorthSummary.trend,
          liquidityRatio: netWorthSummary.current.totalAssets > 0 
            ? Math.round((netWorthSummary.current.liquidAssets / netWorthSummary.current.totalAssets) * 100)
            : 0
        },

        // Investment preferences
        preferences: {
          goals: userDetail?.investmentPreferences?.investmentGoals || [],
          preferredTypes: userDetail?.investmentPreferences?.preferredInvestmentTypes || [],
          timeHorizon: userDetail?.investmentPreferences?.timeHorizon || 'Chưa xác định'
        }
      };

      // Create prompt for Gemini AI
      const aiPrompt = this.createFinancialAdvicePrompt(financialProfile);

      // Get AI advice
      let aiAdvice = '';
      try {
        aiAdvice = await this.geminiService.generateFinancialAdvice(aiPrompt);
      } catch (error) {
        this.logger.error('[getUserFinanceProfile] Error getting AI advice', error);
        aiAdvice = this.generateBasicAdvice(financialProfile);
      }

      const response = {
        success: true,
        data: {
          profile: financialProfile,
          advice: {
            aiGenerated: aiAdvice,
            generatedAt: new Date().toISOString(),
            source: 'gemini-ai'
          },
          summary: {
            netWorth: netWorthSummary.current.netWorth,
            totalAssets: netWorthSummary.current.totalAssets,
            totalDebts: netWorthSummary.current.totalDebts,
            liquidAssets: netWorthSummary.current.liquidAssets,
            monthlyIncome: monthlyIncome,
            monthlySavings: monthlySavings,
            financialHealthScore: (financialMetrics as any)?.overall?.score || (financialMetrics as any)?.overallScore || 0
          }
        },
        timestamp: new Date().toISOString()
      };

      await this.redisService.set(
        cacheKey,
        JSON.stringify(response),
        RedisKeyTtl.THIRTY_DAYS
      );

      return response;

    } catch (error) {
      this.logger.error('[getUserFinanceProfile] Error getting finance profile', error);
      throw error;
    }
  }

  private createFinancialAdvicePrompt(profile: any): string {
    const { user, financial, assets, debts, healthMetrics, preferences, riskAssessment } = profile;

    return `
Bạn là chuyên gia tư vấn tài chính hàng đầu tại Việt Nam. Hãy phân tích và đưa ra lời khuyên chi tiết cho khách hàng sau:

**THÔNG TIN KHÁCH HÀNG:**
- Tên: ${user.name}
- Tuổi: ${user.age || 'Chưa cập nhật'}
- Nghề nghiệp: ${user.occupation}
- Kinh nghiệm đầu tư: ${user.investmentExperience}
- Khẩu vị rủi ro: ${riskAssessment?.current?.riskProfile || 'CONSERVATIVE'} (${riskAssessment?.current?.totalScore || 0} điểm)
${riskAssessment?.current?.summary ? `- Đề xuất phân bổ: ${riskAssessment.current.summary}\n` : ''}

**TÌNH HÌNH TÀI CHÍNH:**
- Thu nhập hàng tháng: ${financial.monthlyIncome?.toLocaleString('vi-VN')} VND
- Chi tiêu hàng tháng: ${financial.monthlyExpenses?.toLocaleString('vi-VN')} VND
- Tiết kiệm hàng tháng: ${financial.monthlySavings?.toLocaleString('vi-VN')} VND
- Tỷ lệ tiết kiệm: ${financial.savingsRate}%
- Tổng tài sản: ${financial.totalAssets?.toLocaleString('vi-VN')} VND
- Tổng nợ: ${financial.totalDebts?.toLocaleString('vi-VN')} VND
- Tài sản ròng: ${financial.netWorth?.toLocaleString('vi-VN')} VND
- Tài sản thanh khoản: ${financial.liquidAssets?.toLocaleString('vi-VN')} VND
- Quỹ khẩn cấp: ${financial.emergencyFundMonths} tháng chi tiêu

**CƠ CẤU TÀI SÂN:** ${assets.totalCategories} loại tài sản
${assets.breakdown.map(asset => `- ${asset.categoryName}: ${asset.totalValue?.toLocaleString('vi-VN')} VND (${asset.percentage}%)`).join('\n')}

**CƠ CẤU NỢ:** ${debts.totalCategories} loại nợ, tỷ lệ nợ/tài sản: ${debts.debtToAssetRatio}%
${debts.breakdown.map(debt => `- ${debt.categoryName}: ${debt.totalValue?.toLocaleString('vi-VN')} VND (${debt.percentage}%)`).join('\n')}

**MỤC TIÊU ĐẦU TƯ:**
- Thời gian đầu tư: ${preferences.timeHorizon}
- Mục tiêu: ${preferences.goals.join(', ') || 'Chưa xác định'}

**YÊU CẦU TƯ VẤN:**
1. Đánh giá tổng quan tình hình tài chính hiện tại
2. Gợi ý cải thiện cơ cấu tài sản và quản lý nợ
3. Kế hoạch đầu tư phù hợp với khẩu vị rủi ro
4. Lời khuyên cụ thể về tiết kiệm và chi tiêu
5. Mục tiêu tài chính ngắn hạn (1 năm) và dài hạn (5-10 năm)
6. Cảnh báo rủi ro và khuyến nghị phòng ngừa

Hãy trả lời bằng tiếng Việt, cụ thể và thực tế với thị trường Việt Nam. Sử dụng emoji để làm nổi bật các phần quan trọng.
    `;
  }

  private generateBasicAdvice(profile: any): string {
    const { financial, user } = profile;
    const savingsRate = financial.savingsRate || 0;
    const age = user.age || 30;

    let advice = `🎯 **PHÂN TÍCH TÀI CHÍNH CÁ NHÂN**\n\n`;
    
    // Đánh giá tỷ lệ tiết kiệm
    if (savingsRate >= 30) {
      advice += `✅ **Tỷ lệ tiết kiệm ${savingsRate}% rất xuất sắc!** Bạn đang trên đường xây dựng sự giàu có bền vững.\n\n`;
    } else if (savingsRate >= 20) {
      advice += `👍 **Tỷ lệ tiết kiệm ${savingsRate}% khá tốt**, nhưng có thể cải thiện thêm.\n\n`;
    } else if (savingsRate >= 10) {
      advice += `⚠️ **Tỷ lệ tiết kiệm ${savingsRate}% cần cải thiện**. Mục tiêu tối thiểu là 20%.\n\n`;
    } else {
      advice += `🚨 **Tỷ lệ tiết kiệm ${savingsRate}% quá thấp**. Cần xem xét lại chi tiêu và tăng tiết kiệm.\n\n`;
    }

    // Gợi ý theo độ tuổi
    advice += `📊 **GỢI Ý ĐẦU TƯ THEO ĐỘ TUỔI (${age} tuổi)**\n\n`;
    
    if (age < 30) {
      advice += `🚀 **Ở tuổi ${age}, bạn có thể chấp nhận rủi ro cao:**\n`;
      advice += `• 70% cổ phiếu tăng trưởng\n• 20% trái phiếu\n• 10% tiền mặt dự phòng\n\n`;
    } else if (age < 50) {
      advice += `⚖️ **Ở tuổi ${age}, nên cân bằng rủi ro:**\n`;
      advice += `• 60% cổ phiếu\n• 30% trái phiếu\n• 10% tiền mặt\n\n`;
    } else {
      advice += `🛡️ **Ở tuổi ${age}, ưu tiên bảo toàn vốn:**\n`;
      advice += `• 40% cổ phiếu\n• 50% trái phiếu\n• 10% tiền mặt\n\n`;
    }

    advice += `💡 **KHUYẾN NGHỊ HÀNH ĐỘNG:**\n`;
    advice += `1. 📱 Thiết lập tự động chuyển tiền tiết kiệm\n`;
    advice += `2. 🏥 Mua bảo hiểm sức khỏe và nhân thọ\n`;
    advice += `3. 📚 Đầu tư vào kiến thức tài chính\n`;
    advice += `4. 📈 Bắt đầu đầu tư định kỳ vào ETF\n`;
    advice += `5. 🔄 Đánh giá lại danh mục mỗi 6 tháng\n\n`;

    advice += `⚠️ **LƯU Ý:** Đây là gợi ý tổng quát. Hãy tham khảo chuyên gia tài chính để có kế hoạch chi tiết phù hợp.`;

    return advice;
  }

  async deleteCache(userId: string) {
    try {
      const keysToDelete = [
        `${RedisKeyPrefix.FINANCIAL_SUMMARY_BY_AI}:${userId}`,
      ];

      await Promise.all(keysToDelete.map(key => this.redisService.del(key)));
    } catch (error) {
      this.logger.error('[deleteCache] Error deleting cache', error);
      throw error;
    }
  }
}
