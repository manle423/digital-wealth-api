import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetAllocation } from './entities/asset-allocation.entity';
import { AssetClass } from './entities/asset-class.entity';
import { AssetClassTranslation } from './entities/asset-class-translation.entity';
import { RiskProfile } from './entities/risk-profile.entity';
import { RiskProfileTranslation } from './entities/risk-profile-translation.entity';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { AdminAssetAllocationController } from './controllers/admin/asset-allocation.controller';
import { AdminAssetClassController } from './controllers/admin/asset-class.controller';
import { AdminRiskProfileController } from './controllers/admin/risk-profile.controller';
import { RiskProfileService } from './services/risk-profile.service';
import { AssetClassService } from './services/asset-class.service';
import { AssetAllocationService } from './services/asset-allocation.service';
import { JwtService } from '@nestjs/jwt';
import { AssetClassRepository } from './repositories/asset-class.repository';
import { AssetAllocationRepository } from './repositories/asset-allocation.repository';
import { RiskProfileRepository } from './repositories/risk-profile.repository';
import { RiskProfileTranslationRepository } from './repositories/risk-profile-translation.repository';
import { AssetClassTranslationRepository } from './repositories/asset-class-translation.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        AssetAllocation,
        AssetClass,
        AssetClassTranslation,
        RiskProfile,
        RiskProfileTranslation,
      ],
      MysqldbConnection.name,
    ),
  ],
  controllers: [
    AdminAssetAllocationController,
    AdminAssetClassController,
    AdminRiskProfileController,
  ],
  providers: [
    RiskProfileService,
    AssetClassService,
    AssetAllocationService,
    JwtService,
    AssetClassRepository,
    AssetAllocationRepository,
    RiskProfileRepository,
    RiskProfileTranslationRepository,
    AssetClassTranslationRepository,
  ],
  exports: [
    RiskProfileRepository,
    AssetAllocationRepository,
    RiskProfileService,
    AssetClassService,
    AssetAllocationService,
  ],
})
export class PortfolioManagementModule {}
