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

@Injectable()
export class UserService {
  constructor(
    private readonly logger: LoggerService,
    private readonly userRepository: UserRepository,
    private readonly userDetailRepository: UserDetailRepository,
    private readonly rabbitmqService: RabbitmqService,
    private readonly redisService: RedisService,
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
}
