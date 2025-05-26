import { Injectable } from '@nestjs/common';
import { FinancialMetric } from '../entities/financial-metric.entity';
import { FinancialMetricRepository } from '../repositories/financial-metric.repository';
import { LoggerService } from '@/shared/logger/logger.service';
import { RedisService } from '@/shared/redis/redis.service';
import { RedisKeyPrefix, RedisKeyTtl } from '@/shared/enums/redis-key.enum';
import { AssetManagementService } from '@/modules/asset-management/services/asset-management.service';
import { NetWorthService } from '@/modules/net-worth/services/net-worth.service';
import { MetricType } from '../enums/metric-type.enum';

@Injectable()
export class FinancialAnalysisService {
  constructor(
    private readonly financialMetricRepository: FinancialMetricRepository,
    private readonly assetManagementService: AssetManagementService,
    private readonly netWorthService: NetWorthService,
    private readonly logger: LoggerService,
    private readonly redisService: RedisService
  ) {}

  async calculateAllMetrics(userId: string): Promise<FinancialMetric[]> {
    try {
      this.logger.info('[calculateAllMetrics]', { userId });

      const cacheKey = `${RedisKeyPrefix.FINANCIAL_METRICS}:${userId}`;
      const cached = await this.redisService.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      // Get base data
      const [netWorthData, assetData] = await Promise.all([
        this.netWorthService.calculateCurrentNetWorth(userId),
        this.assetManagementService.getUserAssets(userId)
      ]);

      const metrics: Partial<FinancialMetric>[] = [];

      // Calculate various metrics
      metrics.push(await this.calculateLiquidityRatio(userId, netWorthData, assetData));
      metrics.push(await this.calculateDebtToAssetRatio(userId, netWorthData));
      metrics.push(await this.calculateInvestmentRatio(userId, netWorthData, assetData));
      metrics.push(await this.calculateNetWorthMetric(userId, netWorthData));
      metrics.push(await this.calculateDiversificationIndex(userId, assetData));

      // Save all metrics
      const savedMetrics = await Promise.all(
        metrics.map(metric => this.financialMetricRepository.create(metric))
      );

      await this.redisService.set(cacheKey, JSON.stringify(savedMetrics), RedisKeyTtl.ONE_HOUR);

      return savedMetrics;
    } catch (error) {
      this.logger.error('[calculateAllMetrics] Error calculating metrics', error);
      throw error;
    }
  }

  async getMetricsByType(userId: string, type: MetricType): Promise<FinancialMetric[]> {
    try {
      this.logger.info('[getMetricsByType]', { userId, type });

      return await this.financialMetricRepository.findByUserIdAndType(userId, type);
    } catch (error) {
      this.logger.error('[getMetricsByType] Error getting metrics by type', error);
      throw error;
    }
  }

  async getLatestMetric(userId: string, type: MetricType): Promise<FinancialMetric | null> {
    try {
      this.logger.info('[getLatestMetric]', { userId, type });

      return await this.financialMetricRepository.findLatestByUserIdAndType(userId, type);
    } catch (error) {
      this.logger.error('[getLatestMetric] Error getting latest metric', error);
      throw error;
    }
  }

  async getMetricTrend(userId: string, type: MetricType, months: number = 12): Promise<{
    date: Date;
    value: number;
  }[]> {
    try {
      this.logger.info('[getMetricTrend]', { userId, type, months });

      return await this.financialMetricRepository.getMetricTrend(userId, type, months);
    } catch (error) {
      this.logger.error('[getMetricTrend] Error getting metric trend', error);
      throw error;
    }
  }

  async getFinancialSummary(userId: string): Promise<{
    liquidity: {
      liquidityRatio: number;
      emergencyFundRatio: number;
      status: 'GOOD' | 'FAIR' | 'POOR';
    };
    debt: {
      debtToAssetRatio: number;
      debtToIncomeRatio: number;
      status: 'GOOD' | 'FAIR' | 'POOR';
    };
    investment: {
      investmentRatio: number;
      diversificationIndex: number;
      status: 'GOOD' | 'FAIR' | 'POOR';
    };
    overall: {
      netWorth: number;
      financialHealthScore: number;
      status: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    };
  }> {
    try {
      this.logger.info('[getFinancialSummary]', { userId });

      const cacheKey = `${RedisKeyPrefix.FINANCIAL_SUMMARY}:${userId}`;
      const cached = await this.redisService.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      const [
        liquidityRatio,
        debtToAssetRatio,
        investmentRatio,
        diversificationIndex,
        netWorthData
      ] = await Promise.all([
        this.getLatestMetric(userId, MetricType.LIQUIDITY_RATIO),
        this.getLatestMetric(userId, MetricType.DEBT_TO_ASSET_RATIO),
        this.getLatestMetric(userId, MetricType.INVESTMENT_RATIO),
        this.getLatestMetric(userId, MetricType.DIVERSIFICATION_INDEX),
        this.netWorthService.calculateCurrentNetWorth(userId)
      ]);

      const summary = {
        liquidity: {
          liquidityRatio: liquidityRatio?.value || 0,
          emergencyFundRatio: 0, // TODO: Calculate emergency fund ratio
          status: this.evaluateLiquidityStatus(liquidityRatio?.value || 0)
        },
        debt: {
          debtToAssetRatio: debtToAssetRatio?.value || 0,
          debtToIncomeRatio: 0, // TODO: Calculate debt to income ratio
          status: this.evaluateDebtStatus(debtToAssetRatio?.value || 0)
        },
        investment: {
          investmentRatio: investmentRatio?.value || 0,
          diversificationIndex: diversificationIndex?.value || 0,
          status: this.evaluateInvestmentStatus(investmentRatio?.value || 0, diversificationIndex?.value || 0)
        },
        overall: {
          netWorth: netWorthData.netWorth,
          financialHealthScore: this.calculateFinancialHealthScore({
            liquidityRatio: liquidityRatio?.value || 0,
            debtToAssetRatio: debtToAssetRatio?.value || 0,
            investmentRatio: investmentRatio?.value || 0,
            diversificationIndex: diversificationIndex?.value || 0
          }),
          status: 'FAIR' as 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'
        }
      };

      // Determine overall status based on financial health score
      if (summary.overall.financialHealthScore >= 80) summary.overall.status = 'EXCELLENT';
      else if (summary.overall.financialHealthScore >= 60) summary.overall.status = 'GOOD';
      else if (summary.overall.financialHealthScore >= 40) summary.overall.status = 'FAIR';
      else summary.overall.status = 'POOR';

      await this.redisService.set(cacheKey, JSON.stringify(summary), RedisKeyTtl.THIRTY_MINUTES);

      return summary;
    } catch (error) {
      this.logger.error('[getFinancialSummary] Error getting financial summary', error);
      throw error;
    }
  }

  private async calculateLiquidityRatio(userId: string, netWorthData: any, assetData: any): Promise<Partial<FinancialMetric>> {
    const liquidAssets = await this.assetManagementService.getLiquidAssets(userId);
    const totalLiquidValue = liquidAssets.reduce((sum, asset) => sum + asset.currentValue, 0);
    const liquidityRatio = netWorthData.totalAssets > 0 ? (totalLiquidValue / netWorthData.totalAssets) * 100 : 0;

    return {
      userId,
      type: MetricType.LIQUIDITY_RATIO,
      value: Number(liquidityRatio.toFixed(2)),
      calculationDate: new Date(),
      category: 'liquidity',
      calculationDetails: {
        formula: '(Liquid Assets / Total Assets) * 100',
        inputs: {
          liquidAssets: totalLiquidValue,
          totalAssets: netWorthData.totalAssets
        }
      },
      isCurrent: true
    };
  }

  private async calculateDebtToAssetRatio(userId: string, netWorthData: any): Promise<Partial<FinancialMetric>> {
    const debtToAssetRatio = netWorthData.totalAssets > 0 ? (netWorthData.totalDebts / netWorthData.totalAssets) * 100 : 0;

    return {
      userId,
      type: MetricType.DEBT_TO_ASSET_RATIO,
      value: Number(debtToAssetRatio.toFixed(2)),
      calculationDate: new Date(),
      category: 'debt',
      calculationDetails: {
        formula: '(Total Debts / Total Assets) * 100',
        inputs: {
          totalDebts: netWorthData.totalDebts,
          totalAssets: netWorthData.totalAssets
        }
      },
      isCurrent: true
    };
  }

  private async calculateInvestmentRatio(userId: string, netWorthData: any, assetData: any): Promise<Partial<FinancialMetric>> {
    const investmentAssets = assetData.assets.filter((asset: any) => 
      asset.type === 'INVESTMENT' || asset.category?.name?.toLowerCase().includes('investment')
    );
    const totalInvestmentValue = investmentAssets.reduce((sum: number, asset: any) => sum + asset.currentValue, 0);
    const investmentRatio = netWorthData.totalAssets > 0 ? (totalInvestmentValue / netWorthData.totalAssets) * 100 : 0;

    return {
      userId,
      type: MetricType.INVESTMENT_RATIO,
      value: Number(investmentRatio.toFixed(2)),
      calculationDate: new Date(),
      category: 'investment',
      calculationDetails: {
        formula: '(Investment Assets / Total Assets) * 100',
        inputs: {
          investmentAssets: totalInvestmentValue,
          totalAssets: netWorthData.totalAssets
        }
      },
      isCurrent: true
    };
  }

  private async calculateNetWorthMetric(userId: string, netWorthData: any): Promise<Partial<FinancialMetric>> {
    return {
      userId,
      type: MetricType.NET_WORTH,
      value: netWorthData.netWorth,
      calculationDate: new Date(),
      category: 'net_worth',
      calculationDetails: {
        formula: 'Total Assets - Total Debts',
        inputs: {
          totalAssets: netWorthData.totalAssets,
          totalDebts: netWorthData.totalDebts
        }
      },
      isCurrent: true
    };
  }

  private async calculateDiversificationIndex(userId: string, assetData: any): Promise<Partial<FinancialMetric>> {
    const categories = assetData.summary.byCategory;
    const totalValue = assetData.summary.totalValue;
    
    // Calculate Herfindahl-Hirschman Index for diversification
    let hhi = 0;
    categories.forEach((category: any) => {
      const percentage = category.totalValue / totalValue;
      hhi += percentage * percentage;
    });
    
    // Convert to diversification index (0-100, higher is better)
    const diversificationIndex = totalValue > 0 ? (1 - hhi) * 100 : 0;

    return {
      userId,
      type: MetricType.DIVERSIFICATION_INDEX,
      value: Number(diversificationIndex.toFixed(2)),
      calculationDate: new Date(),
      category: 'diversification',
      calculationDetails: {
        formula: '(1 - HHI) * 100',
        inputs: {
          hhi,
          categoriesCount: categories.length
        }
      },
      isCurrent: true
    };
  }

  private evaluateLiquidityStatus(liquidityRatio: number): 'GOOD' | 'FAIR' | 'POOR' {
    if (liquidityRatio >= 20) return 'GOOD';
    if (liquidityRatio >= 10) return 'FAIR';
    return 'POOR';
  }

  private evaluateDebtStatus(debtToAssetRatio: number): 'GOOD' | 'FAIR' | 'POOR' {
    if (debtToAssetRatio <= 30) return 'GOOD';
    if (debtToAssetRatio <= 50) return 'FAIR';
    return 'POOR';
  }

  private evaluateInvestmentStatus(investmentRatio: number, diversificationIndex: number): 'GOOD' | 'FAIR' | 'POOR' {
    const avgScore = (investmentRatio + diversificationIndex) / 2;
    if (avgScore >= 60) return 'GOOD';
    if (avgScore >= 30) return 'FAIR';
    return 'POOR';
  }

  private calculateFinancialHealthScore(metrics: {
    liquidityRatio: number;
    debtToAssetRatio: number;
    investmentRatio: number;
    diversificationIndex: number;
  }): number {
    // Weight different metrics
    const liquidityScore = Math.min(metrics.liquidityRatio * 2, 100) * 0.25; // 25% weight
    const debtScore = Math.max(100 - metrics.debtToAssetRatio * 2, 0) * 0.30; // 30% weight
    const investmentScore = Math.min(metrics.investmentRatio, 100) * 0.25; // 25% weight
    const diversificationScore = metrics.diversificationIndex * 0.20; // 20% weight

    return Number((liquidityScore + debtScore + investmentScore + diversificationScore).toFixed(2));
  }

  private async clearFinancialCaches(userId: string): Promise<void> {
    try {
      const keysToDelete = [
        `${RedisKeyPrefix.FINANCIAL_METRICS}:${userId}`,
        `${RedisKeyPrefix.FINANCIAL_SUMMARY}:${userId}`,
      ];

      await Promise.all(keysToDelete.map(key => this.redisService.del(key)));

      this.logger.debug('[clearFinancialCaches] Cleared financial caches', { userId });
    } catch (error) {
      this.logger.error(`[clearFinancialCaches] Error clearing caches: ${error.message}`, { userId });
    }
  }
} 