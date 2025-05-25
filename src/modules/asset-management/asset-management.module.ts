import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetManagementController } from './controllers/asset-management.controller';
import { AssetManagementService } from './services/asset-management.service';
import { UserAssetRepository } from './repositories/user-asset.repository';
import { AssetCategoryRepository } from './repositories/asset-category.repository';
import { UserAsset } from './entities/user-asset.entity';
import { AssetCategory } from './entities/asset-category.entity';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { LoggerModule } from '@/shared/logger/logger.module';
import { RedisModule } from '@/shared/redis/redis.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [UserAsset, AssetCategory],
      MysqldbConnection.name
    ),
    LoggerModule,
    RedisModule,
  ],
  controllers: [AssetManagementController],
  providers: [
    AssetManagementService,
    UserAssetRepository,
    AssetCategoryRepository,
    JwtService,
  ],
  exports: [
    AssetManagementService,
    UserAssetRepository,
    AssetCategoryRepository,
  ],
})
export class AssetManagementModule {} 