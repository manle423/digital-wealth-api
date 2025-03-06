import { PrismaService } from '@/prisma.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/user.dto';
import { hash } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(dto: CreateUserDto) {
    console.info('[createUser] dto:', dto);
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (user){
      throw new ConflictException('EMAIL_ALREADY_EXISTS');
    }

    const newUser = await this.prisma.user.create({ 
      data: {
        ...dto,
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
