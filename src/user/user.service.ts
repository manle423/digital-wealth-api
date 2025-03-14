import { PrismaService } from '@/prisma.service';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { RegisterDto } from '@/auth/dto/register.dto';
import { hash } from 'bcrypt';
import { AuthError } from '@/auth/enum/error.enum';
import { LoggerService } from '@/shared/logger/logger.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async createUser(dto: RegisterDto) {
    this.logger.info('[createUser]', { email: dto.email, name: dto.name });
    
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (user){
      throw new ConflictException(AuthError.EMAIL_ALREADY_EXISTS);
    }

    if (dto.password !== dto.confirmPassword) {
      throw new ConflictException(AuthError.PASSWORD_NOT_MATCH);
    }
    
    const { confirmPassword, ...userData } = dto;
    const newUser = await this.prisma.user.create({ 
      data: {
        ...userData,
        password: await hash(dto.password, 10), 
      }
    });
    const { password, ...result } = newUser;
    return result;
  }

  async findByEmail(email: string) {
    this.logger.info('[findByEmail]', { email });
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    return user;
  }

  async findById(id: number) {
    this.logger.info('[findById]', { userId: id });
    
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException(AuthError.USER_NOT_FOUND);
    }

    const { password, ...result } = user;
    return result;
  }
}
