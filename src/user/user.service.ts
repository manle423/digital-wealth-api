import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RegisterDto } from '@/auth/dto/register.dto';
import { hash } from 'bcrypt';
import { AuthError } from '@/auth/enum/error.enum';
import { LoggerService } from '@/shared/logger/logger.service';
import { UserRepository } from './repositories/user.repository';
import { User } from './entities/user.entity';
import { FindOptionsWhere } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    private readonly logger: LoggerService,
    private readonly userRepository: UserRepository,
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
}
