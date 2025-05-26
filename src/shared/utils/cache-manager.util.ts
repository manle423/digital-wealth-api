import { RedisService } from '@/shared/redis/redis.service';
import { LoggerService } from '@/shared/logger/logger.service';
import { RedisKeyPrefix } from '@/shared/enums/redis-key.enum';

export class CacheManager {
  constructor(
    private readonly redisService: RedisService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Clear all caches related to a specific user
   */
  async clearUserCaches(userId: string, email?: string): Promise<void> {
    try {
      const patterns = [
        // User specific caches
        `${RedisKeyPrefix.USER_PROFILE}:${userId}`,
        `${RedisKeyPrefix.USER_DETAIL}:${userId}`,
        
        // Asset related caches
        `${RedisKeyPrefix.USER_ASSETS_LIST}:${userId}:*`,
        `${RedisKeyPrefix.USER_ASSETS_SUMMARY}:${userId}`,
        `${RedisKeyPrefix.USER_TOTAL_ASSETS}:${userId}`,
        `${RedisKeyPrefix.ASSET_BREAKDOWN}:${userId}`,
        
        // Debt related caches
        `${RedisKeyPrefix.USER_DEBTS_LIST}:${userId}:*`,
        `${RedisKeyPrefix.USER_DEBTS_SUMMARY}:${userId}`,
        `${RedisKeyPrefix.TOTAL_DEBT_VALUE}:${userId}`,
        `${RedisKeyPrefix.DEBT_BREAKDOWN}:${userId}`,
        `${RedisKeyPrefix.DEBT_OVERDUE}:${userId}`,
        `${RedisKeyPrefix.DEBT_UPCOMING}:${userId}:*`,
        
        // Financial analysis caches
        `${RedisKeyPrefix.NET_WORTH}:${userId}`,
        `${RedisKeyPrefix.NET_WORTH_HISTORY}:${userId}`,
        `${RedisKeyPrefix.FINANCIAL_METRICS}:${userId}`,
        `${RedisKeyPrefix.RECOMMENDATIONS}:${userId}`,
      ];

      if (email) {
        patterns.push(`${RedisKeyPrefix.USER_EMAIL}:${email}`);
      }

      await Promise.all(patterns.map(async (pattern) => {
        if (pattern.includes('*')) {
          const prefix = pattern.replace(':*', '');
          await this.redisService.delWithPrefix(prefix);
        } else {
          await this.redisService.del(pattern);
        }
      }));

      this.logger.debug('[CacheManager] Cleared all user caches', { userId, email });
    } catch (error) {
      this.logger.error(`[CacheManager] Error clearing user caches: ${error.message}`, { userId, email });
    }
  }

  /**
   * Clear all asset-related caches for a user
   */
  async clearAssetCaches(userId: string): Promise<void> {
    try {
      const patterns = [
        `${RedisKeyPrefix.USER_ASSETS_LIST}:${userId}:*`,
        `${RedisKeyPrefix.USER_ASSETS_SUMMARY}:${userId}`,
        `${RedisKeyPrefix.USER_TOTAL_ASSETS}:${userId}`,
        `${RedisKeyPrefix.ASSET_BREAKDOWN}:${userId}`,
        `${RedisKeyPrefix.NET_WORTH}:${userId}`,
        `${RedisKeyPrefix.FINANCIAL_METRICS}:${userId}`,
      ];

      await this.clearCachePatterns(patterns);
      this.logger.debug('[CacheManager] Cleared asset caches', { userId });
    } catch (error) {
      this.logger.error(`[CacheManager] Error clearing asset caches: ${error.message}`, { userId });
    }
  }

  /**
   * Clear all debt-related caches for a user
   */
  async clearDebtCaches(userId: string): Promise<void> {
    try {
      const patterns = [
        `${RedisKeyPrefix.USER_DEBTS_LIST}:${userId}:*`,
        `${RedisKeyPrefix.USER_DEBTS_SUMMARY}:${userId}`,
        `${RedisKeyPrefix.TOTAL_DEBT_VALUE}:${userId}`,
        `${RedisKeyPrefix.DEBT_BREAKDOWN}:${userId}`,
        `${RedisKeyPrefix.DEBT_OVERDUE}:${userId}`,
        `${RedisKeyPrefix.DEBT_UPCOMING}:${userId}:*`,
        `${RedisKeyPrefix.NET_WORTH}:${userId}`,
        `${RedisKeyPrefix.FINANCIAL_METRICS}:${userId}`,
      ];

      await this.clearCachePatterns(patterns);
      this.logger.debug('[CacheManager] Cleared debt caches', { userId });
    } catch (error) {
      this.logger.error(`[CacheManager] Error clearing debt caches: ${error.message}`, { userId });
    }
  }

  /**
   * Clear global category caches
   */
  async clearCategoryCaches(): Promise<void> {
    try {
      const prefixes = [
        RedisKeyPrefix.ASSET_CATEGORIES,
        RedisKeyPrefix.DEBT_CATEGORIES,
      ];

      await Promise.all(prefixes.map(prefix => this.redisService.del(prefix)));
      this.logger.debug('[CacheManager] Cleared category caches');
    } catch (error) {
      this.logger.error(`[CacheManager] Error clearing category caches: ${error.message}`);
    }
  }

  /**
   * Clear portfolio management caches
   */
  async clearPortfolioCaches(): Promise<void> {
    try {
      const prefixes = [
        RedisKeyPrefix.RISK_PROFILE,
        RedisKeyPrefix.ASSET_CLASS,
        RedisKeyPrefix.ASSET_ALLOCATION,
      ];

      await Promise.all(prefixes.map(prefix => this.redisService.delWithPrefix(prefix)));
      this.logger.debug('[CacheManager] Cleared portfolio caches');
    } catch (error) {
      this.logger.error(`[CacheManager] Error clearing portfolio caches: ${error.message}`);
    }
  }

  /**
   * Clear question and assessment caches
   */
  async clearQuestionCaches(): Promise<void> {
    try {
      const prefixes = [
        RedisKeyPrefix.QUESTION,
        RedisKeyPrefix.QUESTION_CATEGORY,
      ];

      await Promise.all(prefixes.map(prefix => this.redisService.delWithPrefix(prefix)));
      this.logger.debug('[CacheManager] Cleared question caches');
    } catch (error) {
      this.logger.error(`[CacheManager] Error clearing question caches: ${error.message}`);
    }
  }

  /**
   * Helper method to clear cache patterns
   */
  private async clearCachePatterns(patterns: string[]): Promise<void> {
    await Promise.all(patterns.map(async (pattern) => {
      if (pattern.includes('*')) {
        const prefix = pattern.replace(':*', '');
        await this.redisService.delWithPrefix(prefix);
      } else {
        await this.redisService.del(pattern);
      }
    }));
  }

  /**
   * Generate cache key with consistent format
   */
  static generateKey(prefix: RedisKeyPrefix, ...parts: string[]): string {
    return [prefix, ...parts].join(':');
  }

  /**
   * Hash query object for cache key
   */
  static hashQuery(query: any): string {
    return Buffer.from(JSON.stringify(query || {})).toString('base64').substring(0, 16);
  }
} 