import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule, 
    AuthModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
