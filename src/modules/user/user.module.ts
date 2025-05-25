import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from './repositories/user.repository';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '@/shared/logger/logger.module';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { UserDetail } from './entities/user-detail.entity';
import { UserDetailRepository } from './repositories/user-detail.repository';
import { UserOtp } from './entities/user-otp.entity';
import { UserAuth } from './entities/user-auth.entity';
import { UserOtpRepository } from './repositories/user-otp.repository';
import { UserAuthRepository } from './repositories/user-auth.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [User, UserDetail, UserOtp, UserAuth],
      MysqldbConnection.name),
    LoggerModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    JwtService,
    UserRepository,
    UserDetailRepository,
    UserOtpRepository,
    UserAuthRepository,
  ],
  exports: [UserService, UserOtpRepository, UserAuthRepository],
})
export class UserModule { }
