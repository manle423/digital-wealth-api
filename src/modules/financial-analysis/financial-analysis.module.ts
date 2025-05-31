import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialMetric } from './entities/financial-metric.entity';
import { FinancialMetricRepository } from './repositories/financial-metric.repository';
import { FinancialAnalysisService } from './services/financial-analysis.service';
import { FinancialAnalysisController } from './controllers/financial-analysis.controller';
import { FinancialAnalysisJobService } from './services/financial-analysis-job.service';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { AssetManagementModule } from '@/modules/asset-management/asset-management.module';
import { NetWorthModule } from '@/modules/net-worth/net-worth.module';
import { LoggerModule } from '@/shared/logger/logger.module';
import { RedisModule } from '@/shared/redis/redis.module';
import { UserModule } from '../user/user.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([FinancialMetric], MysqldbConnection.name),
    AssetManagementModule,
    NetWorthModule,
    LoggerModule,
    RedisModule,
    forwardRef(() => UserModule),
  ],
  controllers: [FinancialAnalysisController],
  providers: [
    FinancialMetricRepository,
    FinancialAnalysisService,
    FinancialAnalysisJobService,
    JwtService,
  ],
  exports: [FinancialAnalysisService, FinancialAnalysisJobService],
})
export class FinancialAnalysisModule {}
