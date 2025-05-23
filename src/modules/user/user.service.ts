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

      // Get existing user detail or create new one if it doesn't exist
      let userDetail = await this.userDetailRepository.findOne({ userId });

      if (!userDetail) {
        // Create new user detail
        const newUserDetail: DeepPartial<UserDetail> = {
          userId,
          dateOfBirth: dto.dateOfBirth,
          phoneNumber: dto.phoneNumber,
          occupation: dto.occupation,
          annualIncome: dto.annualIncome,
          investmentExperience: dto.investmentExperience,
          riskTolerance: dto.riskTolerance,
          investmentPreferences: dto.investmentPreferences,
          totalPortfolioValue: dto.totalPortfolioValue,
          // If kycDetails is needed in the future, add it here
        };

        // Add custom fields to investmentPreferences if they don't exist
        if (dto.monthlyExpenses && !newUserDetail.investmentPreferences) {
          newUserDetail.investmentPreferences = {
            monthlyExpenses: dto.monthlyExpenses,
          };
        } else if (dto.monthlyExpenses && newUserDetail.investmentPreferences) {
          newUserDetail.investmentPreferences = {
            ...newUserDetail.investmentPreferences,
            monthlyExpenses: dto.monthlyExpenses,
          };
        }

        await this.userDetailRepository.save(newUserDetail);
      } else {
        // Update existing user detail
        const updateData: DeepPartial<UserDetail> = {};
        
        if (dto.dateOfBirth) updateData.dateOfBirth = dto.dateOfBirth;
        if (dto.phoneNumber) updateData.phoneNumber = dto.phoneNumber;
        if (dto.occupation) updateData.occupation = dto.occupation;
        if (dto.annualIncome) updateData.annualIncome = dto.annualIncome;
        if (dto.investmentExperience) updateData.investmentExperience = dto.investmentExperience;
        if (dto.riskTolerance) updateData.riskTolerance = dto.riskTolerance;
        if (dto.totalPortfolioValue) updateData.totalPortfolioValue = dto.totalPortfolioValue;
        
        // Handle investment preferences update
        if (dto.investmentPreferences || dto.monthlyExpenses) {
          const currentPreferences = userDetail.investmentPreferences || {};
          
          updateData.investmentPreferences = {
            ...currentPreferences,
            ...(dto.investmentPreferences || {}),
          };
          
          // Add monthly expenses to investment preferences
          if (dto.monthlyExpenses) {
            updateData.investmentPreferences.monthlyExpenses = dto.monthlyExpenses;
          }
        }
        
        if (Object.keys(updateData).length > 0) {
          await this.userDetailRepository.update({ userId }, updateData);
        }
      }

      // Xóa tất cả cache liên quan đến user này
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
      // Xóa cache theo ID
      const idCacheKey = `${RedisKeyPrefix.USER_ID}:${userId}`;
      await this.redisService.del(idCacheKey);
      
      // Xóa cache theo email
      const emailCacheKey = `${RedisKeyPrefix.USER_EMAIL}:${email}`;
      await this.redisService.del(emailCacheKey);
      
      // Xóa cache profile
      const profileCacheKey = `${RedisKeyPrefix.USER_PROFILE}:${userId}`;
      await this.redisService.del(profileCacheKey);
      
      this.logger.debug(`Cleared cache for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Error clearing user cache: ${error.message}`, error.stack);
      // Không throw error để không ảnh hưởng đến luồng chính
    }
  }

  async updatePassword(userId: string, hashedPassword: string) {
    this.logger.info('[updatePassword]', { userId });
    return this.userRepository.update({id: userId}, { password: hashedPassword });
  }
}
