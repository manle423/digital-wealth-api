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

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserDetail], MysqldbConnection.name),
    LoggerModule,
  ],
  controllers: [UserController],
  providers: [UserService, JwtService, UserRepository, UserDetailRepository],
  exports: [UserService],
})
export class UserModule {}
