import { Injectable } from '@nestjs/common';
import { NetWorthSnapshot } from '../entities/net-worth-snapshot.entity';
import { LoggerService } from '@/shared/logger/logger.service';
import { RedisService } from '@/shared/redis/redis.service';
import { RedisKeyPrefix, RedisKeyTtl } from '@/shared/enums/redis-key.enum';

@Injectable()
export class NetWorthService {
  constructor(
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
        return JSON.parse(cached);
      }

      // TODO: Implement calculation using AssetManagementService and DebtManagementService
      // const totalAssets = await this.assetManagementService.getTotalAssetValue(userId);
      // const totalDebts = await this.debtManagementService.getTotalDebtValue(userId);
      // const assetBreakdown = await this.assetManagementService.getAssetBreakdown(userId);
      // const debtBreakdown = await this.debtManagementService.getDebtBreakdown(userId);

      const result = {
        totalAssets: 0,
        totalDebts: 0,
        netWorth: 0,
        assetBreakdown: [],
        debtBreakdown: []
      };

      // await this.redisService.setex(cacheKey, RedisKeyTtl.THIRTY_MINUTES, JSON.stringify(result));
      
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

      // TODO: Implement snapshot creation
      // const snapshot = new NetWorthSnapshot();
      // snapshot.userId = userId;
      // snapshot.snapshotDate = new Date();
      // snapshot.totalAssets = netWorthData.totalAssets;
      // snapshot.totalDebts = netWorthData.totalDebts;
      // snapshot.netWorth = netWorthData.netWorth;
      // snapshot.assetBreakdown = netWorthData.assetBreakdown;
      // snapshot.debtBreakdown = netWorthData.debtBreakdown;
      // snapshot.isManual = isManual;

      // Calculate categorized assets and debts
      // snapshot.liquidAssets = this.calculateLiquidAssets(netWorthData.assetBreakdown);
      // snapshot.investmentAssets = this.calculateInvestmentAssets(netWorthData.assetBreakdown);
      // snapshot.realEstateAssets = this.calculateRealEstateAssets(netWorthData.assetBreakdown);
      // snapshot.personalAssets = this.calculatePersonalAssets(netWorthData.assetBreakdown);
      // snapshot.shortTermDebts = this.calculateShortTermDebts(netWorthData.debtBreakdown);
      // snapshot.longTermDebts = this.calculateLongTermDebts(netWorthData.debtBreakdown);

      // const savedSnapshot = await this.netWorthSnapshotRepository.save(snapshot);

      // Clear cache after creating snapshot
      await this.clearNetWorthCaches(userId);

      // return savedSnapshot;

      throw new Error('Not implemented');
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

      // TODO: Implement history retrieval
      // const fromDate = new Date();
      // fromDate.setMonth(fromDate.getMonth() - months);

      // const snapshots = await this.netWorthSnapshotRepository.findByUserIdAndDateRange(
      //   userId, 
      //   fromDate, 
      //   new Date()
      // );

      // await this.redisService.setex(cacheKey, RedisKeyTtl.ONE_HOUR, JSON.stringify(snapshots));

      // return snapshots;

      return [];
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

      const snapshots = await this.getNetWorthHistory(userId, 2);
      
      if (snapshots.length < 2) {
        const current = await this.calculateCurrentNetWorth(userId);
        return {
          currentNetWorth: current.netWorth,
          previousNetWorth: 0,
          change: current.netWorth,
          changePercentage: 0,
          trend: 'STABLE'
        };
      }

      const current = snapshots[0];
      const previous = snapshots[1];
      const change = current.netWorth - previous.netWorth;
      const changePercentage = previous.netWorth !== 0 ? (change / previous.netWorth) * 100 : 0;

      let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
      if (changePercentage > 1) trend = 'UP';
      else if (changePercentage < -1) trend = 'DOWN';

      return {
        currentNetWorth: current.netWorth,
        previousNetWorth: previous.netWorth,
        change,
        changePercentage,
        trend
      };
    } catch (error) {
      this.logger.error('[getNetWorthTrend] Error getting net worth trend', error);
      throw error;
    }
  }

  private calculateLiquidAssets(assetBreakdown: any[]): number {
    // TODO: Implement liquid assets calculation
    return 0;
  }

  private calculateInvestmentAssets(assetBreakdown: any[]): number {
    // TODO: Implement investment assets calculation
    return 0;
  }

  private calculateRealEstateAssets(assetBreakdown: any[]): number {
    // TODO: Implement real estate assets calculation
    return 0;
  }

  private calculatePersonalAssets(assetBreakdown: any[]): number {
    // TODO: Implement personal assets calculation
    return 0;
  }

  private calculateShortTermDebts(debtBreakdown: any[]): number {
    // TODO: Implement short term debts calculation
    return 0;
  }

  private calculateLongTermDebts(debtBreakdown: any[]): number {
    // TODO: Implement long term debts calculation
    return 0;
  }

  private async clearNetWorthCaches(userId: string): Promise<void> {
    const keys = [
      `${RedisKeyPrefix.NET_WORTH}:${userId}`,
      `${RedisKeyPrefix.NET_WORTH_HISTORY}:${userId}:*`
    ];

    await Promise.all(keys.map(key => this.redisService.del(key)));
  }
} 