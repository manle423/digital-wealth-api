import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialMetric } from './entities/financial-metric.entity';
import { FinancialMetricRepository } from './repositories/financial-metric.repository';
import { FinancialAnalysisService } from './services/financial-analysis.service';
import { FinancialAnalysisController } from './controllers/financial-analysis.controller';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { AssetManagementModule } from '@/modules/asset-management/asset-management.module';
import { NetWorthModule } from '@/modules/net-worth/net-worth.module';
import { LoggerModule } from '@/shared/logger/logger.module';
import { RedisModule } from '@/shared/redis/redis.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([FinancialMetric], MysqldbConnection.name),
    AssetManagementModule,
    NetWorthModule,
    LoggerModule,
    RedisModule,
  ],
  controllers: [FinancialAnalysisController],
  providers: [
    FinancialMetricRepository,
    FinancialAnalysisService,
    JwtService,
  ],
  exports: [FinancialAnalysisService],
})
export class FinancialAnalysisModule {} 