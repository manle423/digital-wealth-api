import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recommendation } from './entities/recommendation.entity';
import { RecommendationRepository } from './repositories/recommendation.repository';
import { RecommendationService } from './services/recommendation.service';
import { RecommendationController } from './controllers/recommendation.controller';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { NetWorthModule } from '@/modules/net-worth/net-worth.module';
import { AssetManagementModule } from '@/modules/asset-management/asset-management.module';
import { LoggerModule } from '@/shared/logger/logger.module';
import { RedisModule } from '@/shared/redis/redis.module';
import { FinancialAnalysisModule } from '../financial-analysis/financial-analysis.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recommendation], MysqldbConnection.name),
    FinancialAnalysisModule,
    NetWorthModule,
    AssetManagementModule,
    LoggerModule,
    RedisModule,
  ],
  controllers: [RecommendationController],
  providers: [
    RecommendationRepository,
    RecommendationService,
    JwtService,
  ],
  exports: [RecommendationService],
})
export class RecommendationModule {} 