import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DebtManagementController } from './controllers/debt-management.controller';
import { DebtManagementService } from './services/debt-management.service';
import { UserDebtRepository } from './repositories/user-debt.repository';
import { DebtCategoryRepository } from './repositories/debt-category.repository';
import { UserDebt } from './entities/user-debt.entity';
import { DebtCategory } from './entities/debt-category.entity';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { LoggerModule } from '@/shared/logger/logger.module';
import { RedisModule } from '@/shared/redis/redis.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserDebt, DebtCategory], MysqldbConnection.name),
    LoggerModule,
    RedisModule,
  ],
  controllers: [DebtManagementController],
  providers: [
    DebtManagementService,
    UserDebtRepository,
    DebtCategoryRepository,
    JwtService,
  ],
  exports: [DebtManagementService, UserDebtRepository, DebtCategoryRepository],
})
export class DebtManagementModule {}
