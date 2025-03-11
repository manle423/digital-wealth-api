import { PrismaService } from '@/prisma.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { RegisterDto } from '@/auth/dto/register.dto';
import { hash } from 'bcrypt';
import { AuthError } from '@/auth/enum/error.enum';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(dto: RegisterDto) {
    console.info('[createUser] dto:', dto);
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
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }
}
