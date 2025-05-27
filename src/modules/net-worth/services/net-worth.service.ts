import { Injectable } from '@nestjs/common';
import { NetWorthSnapshot } from '../entities/net-worth-snapshot.entity';
import { NetWorthSnapshotRepository } from '../repositories/net-worth-snapshot.repository';
import { LoggerService } from '@/shared/logger/logger.service';
import { RedisService } from '@/shared/redis/redis.service';
import { RedisKeyPrefix, RedisKeyTtl } from '@/shared/enums/redis-key.enum';
import { AssetManagementService } from '@/modules/asset-management/services/asset-management.service';
import { DebtManagementService } from '@/modules/debt-management/services/debt-management.service';

@Injectable()
export class NetWorthService {
  constructor(
    private readonly netWorthSnapshotRepository: NetWorthSnapshotRepository,
    private readonly assetManagementService: AssetManagementService,
    private readonly debtManagementService: DebtManagementService,
    private readonly logger: LoggerService,
    private readonly redisService: RedisService
  ) {}

  async calculateCurrentNetWorth(userId: string): Promise<{
    totalAssets: number;
    totalDebts: number;
    netWorth: number;
    assetBreakdown: any[];
    debtBreakdown: any[];
  }> {
    try {
      this.logger.info('[calculateCurrentNetWorth]', { userId });

      const cacheKey = `${RedisKeyPrefix.NET_WORTH}:${userId}`;
      const cached = await this.redisService.get(cacheKey);
      
      if (cached) {
        this.logger.debug('[calculateCurrentNetWorth] Cache hit', { cacheKey });
        return JSON.parse(cached);
      }

      // Get data from other services
      const [totalAssets, assetBreakdown, totalDebts, debtBreakdown] = await Promise.all([
        this.assetManagementService.getTotalAssetValue(userId),
        this.assetManagementService.getAssetBreakdown(userId),
        this.debtManagementService.getTotalDebtValue(userId),
        this.debtManagementService.getDebtBreakdown(userId),
      ]);

      const netWorth = totalAssets - totalDebts;

      const result = {
        totalAssets: Number(totalAssets.toFixed(2)),
        totalDebts: Number(totalDebts.toFixed(2)),
        netWorth: Number(netWorth.toFixed(2)),
        assetBreakdown,
        debtBreakdown
      };

      await this.redisService.set(cacheKey, JSON.stringify(result), RedisKeyTtl.THIRTY_MINUTES);
      
      return result;
    } catch (error) {
      this.logger.error('[calculateCurrentNetWorth] Error calculating net worth', error);
      throw error;
    }
  }

  async createSnapshot(userId: string, isManual: boolean = false): Promise<NetWorthSnapshot> {
    try {
      this.logger.info('[createSnapshot]', { userId, isManual });

      const netWorthData = await this.calculateCurrentNetWorth(userId);

      // Get liquid assets
      const liquidAssets = await this.assetManagementService.getLiquidAssets(userId);
      
      // Add null check and ensure numeric values
      const liquidAssetsValue = Array.isArray(liquidAssets) 
        ? liquidAssets.reduce((sum, asset) => {
            const value = Number(asset?.currentValue || 0);
            return sum + (isNaN(value) ? 0 : value);
          }, 0)
        : 0;

      const snapshot = await this.netWorthSnapshotRepository.create({
        userId,
        snapshotDate: new Date(),
        totalAssets: netWorthData.totalAssets,
        totalDebts: netWorthData.totalDebts,
        netWorth: netWorthData.netWorth,
        assetBreakdown: netWorthData.assetBreakdown,
        debtBreakdown: netWorthData.debtBreakdown,
        liquidAssets: Number(liquidAssetsValue.toFixed(2)),
        investmentAssets: this.calculateInvestmentAssets(netWorthData.assetBreakdown),
        realEstateAssets: this.calculateRealEstateAssets(netWorthData.assetBreakdown),
        personalAssets: this.calculatePersonalAssets(netWorthData.assetBreakdown),
        shortTermDebts: this.calculateShortTermDebts(netWorthData.debtBreakdown),
        longTermDebts: this.calculateLongTermDebts(netWorthData.debtBreakdown),
        isManual
      });

      // Clear cache after creating snapshot
      await this.clearNetWorthCaches(userId);

      // Clean up old snapshots (keep last 100)
      await this.netWorthSnapshotRepository.deleteOldSnapshots(userId, 100);

      return snapshot;
    } catch (error) {
      this.logger.error('[createSnapshot] Error creating net worth snapshot', error);
      throw error;
    }
  }

  async getNetWorthHistory(userId: string, months: number = 12): Promise<NetWorthSnapshot[]> {
    try {
      this.logger.info('[getNetWorthHistory]', { userId, months });

      const cacheKey = `${RedisKeyPrefix.NET_WORTH_HISTORY}:${userId}:${months}`;
      const cached = await this.redisService.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      const fromDate = new Date();
      fromDate.setMonth(fromDate.getMonth() - months);

      const snapshots = await this.netWorthSnapshotRepository.findByUserIdAndDateRange(
        userId, 
        fromDate, 
        new Date()
      );

      await this.redisService.set(cacheKey, JSON.stringify(snapshots), RedisKeyTtl.ONE_HOUR);

      return snapshots;
    } catch (error) {
      this.logger.error('[getNetWorthHistory] Error getting net worth history', error);
      throw error;
    }
  }

  async getNetWorthTrend(userId: string): Promise<{
    currentNetWorth: number;
    previousNetWorth: number;
    change: number;
    changePercentage: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
  }> {
    try {
      this.logger.info('[getNetWorthTrend]', { userId });

      const snapshots = await this.netWorthSnapshotRepository.findByUserIdWithLimit(userId, 2);
      
      if (snapshots.length === 0) {
        const current = await this.calculateCurrentNetWorth(userId);
        return {
          currentNetWorth: current.netWorth,
          previousNetWorth: 0,
          change: current.netWorth,
          changePercentage: 0,
          trend: 'STABLE'
        };
      }

      const currentNetWorth = snapshots[0]?.netWorth || 0;
      const previousNetWorth = snapshots[1]?.netWorth || 0;
      
      // If only one snapshot, compare with current calculation
      if (snapshots.length === 1) {
        const current = await this.calculateCurrentNetWorth(userId);
        const change = current.netWorth - currentNetWorth;
        const changePercentage = currentNetWorth !== 0 ? (change / currentNetWorth) * 100 : 0;

        let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
        if (changePercentage > 1) trend = 'UP';
        else if (changePercentage < -1) trend = 'DOWN';

        return {
          currentNetWorth: current.netWorth,
          previousNetWorth: currentNetWorth,
          change,
          changePercentage,
          trend
        };
      }

      const change = currentNetWorth - previousNetWorth;
      const changePercentage = previousNetWorth !== 0 ? (change / previousNetWorth) * 100 : 0;

      let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
      if (changePercentage > 1) trend = 'UP';
      else if (changePercentage < -1) trend = 'DOWN';

      return {
        currentNetWorth,
        previousNetWorth,
        change: Number(change.toFixed(2)),
        changePercentage: Number(changePercentage.toFixed(2)),
        trend
      };
    } catch (error) {
      this.logger.error('[getNetWorthTrend] Error getting net worth trend', error);
      throw error;
    }
  }

  async getNetWorthSummary(userId: string): Promise<{
    current: {
      totalAssets: number;
      totalDebts: number;
      netWorth: number;
      liquidAssets: number;
    };
    trend: {
      change: number;
      changePercentage: number;
      trend: 'UP' | 'DOWN' | 'STABLE';
    };
    breakdown: {
      assets: any[];
      debts: any[];
    };
  }> {
    try {
      this.logger.info('[getNetWorthSummary]', { userId });

      const [currentNetWorth, trendData, liquidAssets] = await Promise.all([
        this.calculateCurrentNetWorth(userId),
        this.getNetWorthTrend(userId),
        this.assetManagementService.getLiquidAssets(userId)
      ]);

      // Add null check and ensure numeric values
      const liquidAssetsValue = Array.isArray(liquidAssets) 
        ? liquidAssets.reduce((sum, asset) => {
            const value = Number(asset?.currentValue || 0);
            return sum + (isNaN(value) ? 0 : value);
          }, 0)
        : 0;

      return {
        current: {
          totalAssets: currentNetWorth.totalAssets,
          totalDebts: currentNetWorth.totalDebts,
          netWorth: currentNetWorth.netWorth,
          liquidAssets: Number(liquidAssetsValue.toFixed(2))
        },
        trend: {
          change: trendData.change,
          changePercentage: trendData.changePercentage,
          trend: trendData.trend
        },
        breakdown: {
          assets: currentNetWorth.assetBreakdown,
          debts: currentNetWorth.debtBreakdown
        }
      };
    } catch (error) {
      this.logger.error('[getNetWorthSummary] Error getting net worth summary', error);
      throw error;
    }
  }

  private calculateLiquidAssets(assetBreakdown: any[]): number {
    // Calculate liquid assets based on category names or types
    const liquidCategories = ['cash', 'savings', 'checking', 'money_market'];
    return assetBreakdown
      .filter(item => liquidCategories.some(cat => 
        item.categoryName?.toLowerCase().includes(cat)
      ))
      .reduce((sum, item) => sum + (item.totalValue || 0), 0);
  }

  private calculateInvestmentAssets(assetBreakdown: any[]): number {
    const investmentTypes = ['stocks', 'bonds', 'mutual_funds', 'etf', 'crypto'];
    return assetBreakdown
      .filter(item => 
        // Check by category name
        investmentTypes.some(type => item.categoryName?.toLowerCase().includes(type)) ||
        // Check by asset type if available
        (item.type && ['STOCK', 'BOND', 'MUTUAL_FUND', 'ETF', 'CRYPTO'].includes(item.type))
      )
      .reduce((sum, item) => sum + (Number(item.totalValue) || 0), 0);
  }

  private calculateRealEstateAssets(assetBreakdown: any[]): number {
    const realEstateCategories = ['real_estate', 'property', 'house', 'apartment'];
    return assetBreakdown
      .filter(item => realEstateCategories.some(cat => 
        item.categoryName?.toLowerCase().includes(cat)
      ))
      .reduce((sum, item) => sum + (item.totalValue || 0), 0);
  }

  private calculatePersonalAssets(assetBreakdown: any[]): number {
    const personalCategories = ['vehicle', 'jewelry', 'electronics', 'furniture'];
    return assetBreakdown
      .filter(item => personalCategories.some(cat => 
        item.categoryName?.toLowerCase().includes(cat)
      ))
      .reduce((sum, item) => sum + (item.totalValue || 0), 0);
  }

  private calculateShortTermDebts(debtBreakdown: any[]): number {
    const shortTermCategories = ['credit_card', 'personal_loan', 'short_term'];
    return debtBreakdown
      .filter(item => shortTermCategories.some(cat => 
        item.categoryName?.toLowerCase().includes(cat)
      ))
      .reduce((sum, item) => sum + (item.totalValue || 0), 0);
  }

  private calculateLongTermDebts(debtBreakdown: any[]): number {
    const longTermCategories = ['mortgage', 'auto_loan', 'student_loan', 'long_term'];
    return debtBreakdown
      .filter(item => longTermCategories.some(cat => 
        item.categoryName?.toLowerCase().includes(cat)
      ))
      .reduce((sum, item) => sum + (item.totalValue || 0), 0);
  }

  private async clearNetWorthCaches(userId: string): Promise<void> {
    try {
      const keysToDelete = [
        `${RedisKeyPrefix.NET_WORTH}:${userId}`,
        `${RedisKeyPrefix.NET_WORTH_HISTORY}:${userId}:*`,
      ];

      await Promise.all(keysToDelete.map(async (pattern) => {
        if (pattern.includes('*')) {
          const prefix = pattern.replace(':*', '');
          await this.redisService.delWithPrefix(prefix);
        } else {
          await this.redisService.del(pattern);
        }
      }));

      this.logger.debug('[clearNetWorthCaches] Cleared net worth caches', { userId });
    } catch (error) {
      this.logger.error(`[clearNetWorthCaches] Error clearing caches: ${error.message}`, { userId });
    }
  }
} 