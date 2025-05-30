import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { UserDebtRepository } from '../repositories/user-debt.repository';
import { DebtCategoryRepository } from '../repositories/debt-category.repository';
import { CreateDebtDto } from '../dto/create-debt.dto';
import { UpdateDebtDto } from '../dto/update-debt.dto';
import { GetDebtsDto, UpdateDebtBalanceDto } from '../dto/get-debts.dto';
import { CreateDebtCategoryDto } from '../dto/create-debt-category.dto';
import { UserDebt } from '../entities/user-debt.entity';
import { DebtCategory } from '../entities/debt-category.entity';
import { LoggerService } from '@/shared/logger/logger.service';
import { RedisService } from '@/shared/redis/redis.service';
import { RedisKeyPrefix, RedisKeyTtl } from '@/shared/enums/redis-key.enum';
import { DebtStatus } from '../enums/debt-status.enum';

@Injectable()
export class DebtManagementService {
  constructor(
    private readonly userDebtRepository: UserDebtRepository,
    private readonly debtCategoryRepository: DebtCategoryRepository,
    private readonly logger: LoggerService,
    private readonly redisService: RedisService,
  ) {}

  async getUserDebts(userId: string, filters: GetDebtsDto) {
    try {
      this.logger.info('[getUserDebts]', { userId, filters });

      const filtersHash = this.hashFilters(filters);
      const cacheKey = `${RedisKeyPrefix.USER_DEBTS_LIST}:${userId}:${filtersHash}`;
      const cached = await this.redisService.get(cacheKey);

      if (cached) {
        this.logger.debug('[getUserDebts] Cache hit', { cacheKey });
        return JSON.parse(cached);
      }

      const result = await this.userDebtRepository.findByUserIdWithFilters(
        userId,
        filters,
      );

      await this.redisService.set(
        cacheKey,
        JSON.stringify(result),
        RedisKeyTtl.FIFTEEN_MINUTES,
      );

      return result;
    } catch (error) {
      this.logger.error('[getUserDebts] Error getting user debts', error);
      throw error;
    }
  }

  async getDebtById(userId: string, debtId: string): Promise<UserDebt> {
    try {
      this.logger.info('[getDebtById]', { userId, debtId });

      const debt = await this.userDebtRepository.findByUserIdAndId(
        userId,
        debtId,
      );

      if (!debt) {
        throw new NotFoundException('Debt not found');
      }

      return debt;
    } catch (error) {
      this.logger.error('[getDebtById] Error getting debt by id', error);
      throw error;
    }
  }

  async createDebt(userId: string, createDebtDto: CreateDebtDto) {
    try {
      this.logger.info('[createDebt]', { userId, createDebtDto });

      // Validate category exists
      const categoryExists = await this.debtCategoryRepository.exists(
        createDebtDto.categoryId,
      );
      if (!categoryExists) {
        throw new BadRequestException('Invalid debt category');
      }

      // Validate business rules
      this.validateDebtData(createDebtDto);

      const debtData = {
        ...createDebtDto,
        userId,
        startDate: createDebtDto.startDate
          ? new Date(createDebtDto.startDate)
          : null,
        dueDate: createDebtDto.dueDate ? new Date(createDebtDto.dueDate) : null,
        lastPaymentDate: createDebtDto.lastPaymentDate
          ? new Date(createDebtDto.lastPaymentDate)
          : null,
        nextPaymentDate: createDebtDto.nextPaymentDate
          ? new Date(createDebtDto.nextPaymentDate)
          : null,
        // Auto-calculate payment schedule if not provided
        paymentSchedule:
          createDebtDto.paymentSchedule ||
          this.calculatePaymentSchedule(createDebtDto),
      };

      const debt = await this.userDebtRepository.create(debtData);

      // Clear cache
      await this.clearDebtCaches(userId);

      return debt;
    } catch (error) {
      this.logger.error('[createDebt] Error creating debt', error);
      throw error;
    }
  }

  async updateDebt(
    userId: string,
    debtId: string,
    updateDebtDto: UpdateDebtDto,
  ) {
    try {
      this.logger.info('[updateDebt]', { userId, debtId, updateDebtDto });

      const existingDebt = await this.getDebtById(userId, debtId);

      if (
        updateDebtDto.categoryId &&
        updateDebtDto.categoryId !== existingDebt.categoryId
      ) {
        const categoryExists = await this.debtCategoryRepository.exists(
          updateDebtDto.categoryId,
        );
        if (!categoryExists) {
          throw new BadRequestException('Invalid debt category');
        }
      }

      // Validate business rules
      this.validateDebtData(updateDebtDto);

      // Normalize dates in updateDebtDto first
      const normalizedUpdateDto = {
        ...updateDebtDto,
        startDate: updateDebtDto.startDate
          ? new Date(updateDebtDto.startDate)
          : undefined,
        dueDate: updateDebtDto.dueDate
          ? new Date(updateDebtDto.dueDate)
          : undefined,
        lastPaymentDate: updateDebtDto.lastPaymentDate
          ? new Date(updateDebtDto.lastPaymentDate)
          : undefined,
        nextPaymentDate: updateDebtDto.nextPaymentDate
          ? new Date(updateDebtDto.nextPaymentDate)
          : undefined,
      };

      // Merge existing debt data with normalized update data
      const mergedData = { ...existingDebt, ...normalizedUpdateDto };

      const updateData = {
        ...normalizedUpdateDto,
        // Recalculate payment schedule if relevant fields changed
        paymentSchedule:
          updateDebtDto.paymentSchedule ||
          (this.shouldRecalculatePaymentSchedule(updateDebtDto)
            ? this.calculatePaymentSchedule(mergedData)
            : existingDebt.paymentSchedule),
      };

      const updatedDebt = await this.userDebtRepository.update(
        { id: debtId },
        updateData,
      );

      // Clear cache
      await this.clearDebtCaches(userId);

      return updatedDebt;
    } catch (error) {
      this.logger.error('[updateDebt] Error updating debt', error);
      throw error;
    }
  }

  async deleteDebt(userId: string, debtId: string): Promise<void> {
    try {
      this.logger.info('[deleteDebt]', { userId, debtId });

      await this.getDebtById(userId, debtId); // Validate debt exists and belongs to user

      await this.userDebtRepository.delete({ id: debtId });

      // Clear cache
      await this.clearDebtCaches(userId);
    } catch (error) {
      this.logger.error('[deleteDebt] Error deleting debt', error);
      throw error;
    }
  }

  async updateDebtBalance(
    userId: string,
    debtId: string,
    updateBalanceDto: UpdateDebtBalanceDto,
  ) {
    try {
      this.logger.info('[updateDebtBalance]', {
        userId,
        debtId,
        updateBalanceDto,
      });

      const debt = await this.getDebtById(userId, debtId);

      const updateData: Partial<UserDebt> = {
        currentBalance: updateBalanceDto.currentBalance,
      };

      if (updateBalanceDto.lastPaymentDate) {
        updateData.lastPaymentDate = new Date(updateBalanceDto.lastPaymentDate);
      }

      if (updateBalanceDto.paymentAmount) {
        updateData.totalPaid =
          (debt.totalPaid || 0) + updateBalanceDto.paymentAmount;
      }

      if (updateBalanceDto.notes) {
        updateData.notes = updateBalanceDto.notes;
      }

      // Auto-update status if debt is paid off
      if (updateBalanceDto.currentBalance === 0) {
        updateData.status = DebtStatus.PAID_OFF;
        // Không cần nextPaymentDate nếu đã trả hết
        updateData.nextPaymentDate = null;
      } else {
        // Tính nextPaymentDate nếu còn nợ
        updateData.nextPaymentDate = this.calculateNextPaymentDate(
          updateBalanceDto.lastPaymentDate
            ? new Date(updateBalanceDto.lastPaymentDate)
            : new Date(),
        );
      }

      // Recalculate payment schedule with updated balance
      const mergedData = { ...debt, ...updateData };
      updateData.paymentSchedule = this.calculatePaymentSchedule(mergedData);

      const updatedDebt = await this.userDebtRepository.update(
        { id: debtId },
        updateData,
      );

      // Clear cache
      await this.clearDebtCaches(userId);

      return updatedDebt;
    } catch (error) {
      this.logger.error(
        '[updateDebtBalance] Error updating debt balance',
        error,
      );
      throw error;
    }
  }

  /**
   * Tính toán ngày thanh toán tiếp theo (hiện tại chỉ hỗ trợ monthly)
   */
  private calculateNextPaymentDate(lastPaymentDate: Date): Date {
    const nextPaymentDate = new Date(lastPaymentDate);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

    // Xử lý trường hợp cuối tháng
    if (nextPaymentDate.getDate() !== lastPaymentDate.getDate()) {
      nextPaymentDate.setDate(0); // Set về ngày cuối tháng
    }

    return nextPaymentDate;
  }

  async getTotalDebtValue(userId: string): Promise<number> {
    try {
      this.logger.info('[getTotalDebtValue]', { userId });

      const cacheKey = `${RedisKeyPrefix.TOTAL_DEBT_VALUE}:${userId}`;
      const cached = await this.redisService.get(cacheKey);

      if (cached) {
        this.logger.debug('[getTotalDebtValue] Cache hit', { cacheKey });
        return parseFloat(cached);
      }

      const totalValue =
        await this.userDebtRepository.getTotalDebtValue(userId);

      await this.redisService.set(
        cacheKey,
        totalValue.toString(),
        RedisKeyTtl.THIRTY_MINUTES,
      );

      return totalValue;
    } catch (error) {
      this.logger.error(
        '[getTotalDebtValue] Error getting total debt value',
        error,
      );
      throw error;
    }
  }

  async getDebtBreakdown(userId: string) {
    try {
      this.logger.info('[getDebtBreakdown]', { userId });

      const cacheKey = `${RedisKeyPrefix.DEBT_BREAKDOWN}:${userId}`;
      const cached = await this.redisService.get(cacheKey);

      if (cached) {
        this.logger.debug('[getDebtBreakdown] Cache hit', { cacheKey });
        return JSON.parse(cached);
      }

      const breakdown = await this.userDebtRepository.getDebtBreakdown(userId);
      const totalDebt = await this.getTotalDebtValue(userId);

      const result = breakdown.map((item) => ({
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        totalValue: parseFloat(item.totalValue),
        count: parseInt(item.count),
        percentage:
          totalDebt > 0 ? (parseFloat(item.totalValue) / totalDebt) * 100 : 0,
      }));

      await this.redisService.set(
        cacheKey,
        JSON.stringify(result),
        RedisKeyTtl.THIRTY_MINUTES,
      );

      return result;
    } catch (error) {
      this.logger.error(
        '[getDebtBreakdown] Error getting debt breakdown',
        error,
      );
      throw error;
    }
  }

  async getOverdueDebts(userId: string): Promise<UserDebt[]> {
    try {
      this.logger.info('[getOverdueDebts]', { userId });

      const cacheKey = `${RedisKeyPrefix.DEBT_OVERDUE}:${userId}`;
      const cached = await this.redisService.get(cacheKey);

      if (cached) {
        this.logger.debug('[getOverdueDebts] Cache hit', { cacheKey });
        return JSON.parse(cached);
      }

      const overdueDebts =
        await this.userDebtRepository.getOverdueDebts(userId);

      await this.redisService.set(
        cacheKey,
        JSON.stringify(overdueDebts),
        RedisKeyTtl.FIFTEEN_MINUTES,
      );

      return overdueDebts;
    } catch (error) {
      this.logger.error('[getOverdueDebts] Error getting overdue debts', error);
      throw error;
    }
  }

  async getUpcomingPayments(
    userId: string,
    days: number = 30,
  ): Promise<UserDebt[]> {
    try {
      this.logger.info('[getUpcomingPayments]', { userId, days });

      const cacheKey = `${RedisKeyPrefix.DEBT_UPCOMING}:${userId}:${days}`;
      const cached = await this.redisService.get(cacheKey);

      // if (cached) {
      //   this.logger.debug('[getUpcomingPayments] Cache hit', { cacheKey });
      //   return JSON.parse(cached);
      // }

      const upcomingPayments =
        await this.userDebtRepository.getUpcomingPayments(userId, days);

      await this.redisService.set(
        cacheKey,
        JSON.stringify(upcomingPayments),
        RedisKeyTtl.FIFTEEN_MINUTES,
      );

      return upcomingPayments;
    } catch (error) {
      this.logger.error(
        '[getUpcomingPayments] Error getting upcoming payments',
        error,
      );
      throw error;
    }
  }

  async getDebtCategories(): Promise<DebtCategory[]> {
    try {
      this.logger.info('[getDebtCategories]');

      const cacheKey = `${RedisKeyPrefix.DEBT_CATEGORIES}`;
      const cached = await this.redisService.get(cacheKey);

      if (cached) {
        this.logger.debug('[getDebtCategories] Cache hit', { cacheKey });
        return JSON.parse(cached);
      }

      const categories = await this.debtCategoryRepository.findAll();

      await this.redisService.set(
        cacheKey,
        JSON.stringify(categories),
        RedisKeyTtl.ONE_HOUR,
      );

      return categories;
    } catch (error) {
      this.logger.error(
        '[getDebtCategories] Error getting debt categories',
        error,
      );
      throw error;
    }
  }

  async createDebtCategory(
    createCategoryDto: CreateDebtCategoryDto,
  ): Promise<DebtCategory> {
    try {
      this.logger.info('[createDebtCategory]', { createCategoryDto });

      // Check if code name is unique
      const isUnique = await this.debtCategoryRepository.isCodeNameUnique(
        createCategoryDto.codeName,
      );
      if (!isUnique) {
        throw new ConflictException('Code name already exists');
      }

      const category =
        await this.debtCategoryRepository.create(createCategoryDto);

      // Clear categories cache
      await this.redisService.del(`${RedisKeyPrefix.DEBT_CATEGORIES}`);

      return category;
    } catch (error) {
      this.logger.error(
        '[createDebtCategory] Error creating debt category',
        error,
      );
      throw error;
    }
  }

  /**
   * Convert any value to number safely
   */
  private convertToNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  async getDebtSummary(userId: string) {
    try {
      this.logger.info('[getDebtSummary]', { userId });

      const cacheKey = `${RedisKeyPrefix.USER_DEBTS_SUMMARY}:${userId}`;
      const cached = await this.redisService.get(cacheKey);

      if (cached) {
        this.logger.debug('[getDebtSummary] Cache hit', { cacheKey });
        return JSON.parse(cached);
      }

      const [totalDebt, breakdown, overdueDebts, upcomingPayments] =
        await Promise.all([
          this.getTotalDebtValue(userId),
          this.getDebtBreakdown(userId),
          this.getOverdueDebts(userId),
          this.getUpcomingPayments(userId),
        ]);
      console.log('overdueDebts', overdueDebts);
      const result = {
        totalDebt: Number(totalDebt.toFixed(2)),
        breakdown,
        overdueCount: overdueDebts.length,
        overdueAmount: Number(
          overdueDebts
            .reduce((sum, debt) => {
              return sum + this.convertToNumber(debt.currentBalance);
            }, 0)
            .toFixed(2),
        ),
        upcomingPaymentsCount: upcomingPayments.length,
        upcomingPaymentsAmount: Number(
          upcomingPayments
            .reduce((sum, debt) => {
              return sum + this.convertToNumber(debt.monthlyPayment);
            }, 0)
            .toFixed(2),
        ),
      };

      await this.redisService.set(
        cacheKey,
        JSON.stringify(result),
        RedisKeyTtl.FIFTEEN_MINUTES,
      );

      return result;
    } catch (error) {
      this.logger.error('[getDebtSummary] Error getting debt summary', error);
      throw error;
    }
  }

  // Helper methods
  private hashFilters(filters: GetDebtsDto): string {
    return Buffer.from(JSON.stringify(filters || {}))
      .toString('base64')
      .substring(0, 16);
  }

  private validateDebtData(
    debtData: Partial<CreateDebtDto | UpdateDebtDto>,
  ): void {
    if (
      debtData.currentBalance !== undefined &&
      debtData.originalAmount !== undefined
    ) {
      if (debtData.currentBalance > debtData.originalAmount) {
        throw new BadRequestException(
          'Current balance cannot be greater than original amount',
        );
      }
    }

    if (
      debtData.interestRate !== undefined &&
      (debtData.interestRate < 0 || debtData.interestRate > 100)
    ) {
      throw new BadRequestException('Interest rate must be between 0 and 100');
    }

    if (debtData.startDate && debtData.dueDate) {
      const startDate = new Date(debtData.startDate);
      const dueDate = new Date(debtData.dueDate);

      if (dueDate <= startDate) {
        throw new BadRequestException('Due date must be after start date');
      }
    }
  }

  public async clearDebtCaches(userId: string): Promise<void> {
    try {
      // Clear all user debt related caches
      const keysToDelete = [
        `${RedisKeyPrefix.USER_DEBTS_LIST}:${userId}:*`,
        `${RedisKeyPrefix.USER_DEBTS_SUMMARY}:${userId}`,
        `${RedisKeyPrefix.TOTAL_DEBT_VALUE}:${userId}`,
        `${RedisKeyPrefix.DEBT_BREAKDOWN}:${userId}`,
        `${RedisKeyPrefix.DEBT_OVERDUE}:${userId}`,
        `${RedisKeyPrefix.DEBT_UPCOMING}:${userId}:*`,
        `${RedisKeyPrefix.NET_WORTH}:${userId}`,
        `${RedisKeyPrefix.FINANCIAL_METRICS}:${userId}`,
      ];
      await Promise.all(
        keysToDelete.map(async (pattern) => {
          if (pattern.includes('*')) {
            // For wildcard patterns, use delWithPrefix
            const prefix = pattern.replace(':*', '');
            await this.redisService.delWithPrefix(prefix);
          } else {
            // For exact keys, use del
            await this.redisService.del(pattern);
          }
        }),
      );

      this.logger.debug('[clearDebtCaches] Cleared all debt caches', {
        userId,
      });
    } catch (error) {
      this.logger.error(
        `[clearDebtCaches] Error clearing caches: ${error.message}`,
        { userId },
      );
    }
  }

  /**
   * Calculate payment schedule automatically
   */
  private calculatePaymentSchedule(
    debtData: Partial<CreateDebtDto | UpdateDebtDto | UserDebt>,
  ): any {
    try {
      // Default values
      const frequency = 'MONTHLY';
      const amount = debtData.monthlyPayment || 0;

      // Calculate next payment date
      let nextPaymentDate: Date;
      if (debtData.lastPaymentDate) {
        nextPaymentDate = new Date(debtData.lastPaymentDate);
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 30); // Add 30 days
      } else if (debtData.startDate) {
        nextPaymentDate = new Date(debtData.startDate);
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 30); // Add 30 days
      } else {
        // If no dates available, use current date + 30 days
        nextPaymentDate = new Date();
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);
      }

      // Calculate remaining payments
      let remainingPayments: number | undefined;
      if (
        amount > 0 &&
        debtData.currentBalance &&
        debtData.currentBalance > 0
      ) {
        // Basic calculation: remaining balance / monthly payment
        remainingPayments = Math.ceil(debtData.currentBalance / amount);

        // If we have term months, use the smaller value
        if (debtData.termMonths) {
          const totalPaidMonths = debtData.totalPaid
            ? Math.floor(debtData.totalPaid / amount)
            : 0;
          const remainingTermMonths = debtData.termMonths - totalPaidMonths;
          remainingPayments = Math.min(
            remainingPayments,
            Math.max(0, remainingTermMonths),
          );
        }
      } else if (debtData.termMonths && debtData.totalPaid && amount > 0) {
        // Calculate based on term months and total paid
        const totalPaidMonths = Math.floor(debtData.totalPaid / amount);
        remainingPayments = Math.max(0, debtData.termMonths - totalPaidMonths);
      }

      return {
        frequency,
        amount,
        nextPaymentDate,
        remainingPayments,
      };
    } catch (error) {
      this.logger.error(
        '[calculatePaymentSchedule] Error calculating payment schedule',
        error,
      );
      // Return default schedule if calculation fails
      return {
        frequency: 'MONTHLY',
        amount: debtData.monthlyPayment || 0,
        nextPaymentDate: new Date(),
        remainingPayments: undefined,
      };
    }
  }

  /**
   * Check if payment schedule should be recalculated
   */
  private shouldRecalculatePaymentSchedule(updateData: UpdateDebtDto): boolean {
    return !!(
      updateData.monthlyPayment !== undefined ||
      updateData.currentBalance !== undefined ||
      updateData.lastPaymentDate !== undefined ||
      updateData.startDate !== undefined ||
      updateData.termMonths !== undefined ||
      updateData.totalPaid !== undefined
    );
  }
}
