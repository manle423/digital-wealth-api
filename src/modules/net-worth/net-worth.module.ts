import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetWorthSnapshot } from './entities/net-worth-snapshot.entity';
import { NetWorthSnapshotRepository } from './repositories/net-worth-snapshot.repository';
import { NetWorthService } from './services/net-worth.service';
import { NetWorthController } from './controllers/net-worth.controller';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { AssetManagementModule } from '@/modules/asset-management/asset-management.module';
import { DebtManagementModule } from '@/modules/debt-management/debt-management.module';
import { LoggerModule } from '@/shared/logger/logger.module';
import { RedisModule } from '@/shared/redis/redis.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([NetWorthSnapshot], MysqldbConnection.name),
    AssetManagementModule,
    DebtManagementModule,
    LoggerModule,
    RedisModule,
  ],
  controllers: [NetWorthController],
  providers: [
    NetWorthSnapshotRepository,
    NetWorthService,
    JwtService,
  ],
  exports: [NetWorthService],
})
export class NetWorthModule {} 