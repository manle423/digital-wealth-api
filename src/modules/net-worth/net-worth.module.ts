import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetWorthSnapshot } from './entities/net-worth-snapshot.entity';
import { NetWorthSnapshotRepository } from './repositories/net-worth-snapshot.repository';
import { NetWorthService } from './services/net-worth.service';
import { NetWorthController } from './controllers/net-worth.controller';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { AssetManagementModule } from '@/modules/asset-management/asset-management.module';
import { LoggerModule } from '@/shared/logger/logger.module';
import { RedisModule } from '@/shared/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NetWorthSnapshot], MysqldbConnection.name),
    AssetManagementModule,
    LoggerModule,
    RedisModule,
  ],
  controllers: [NetWorthController],
  providers: [
    NetWorthSnapshotRepository,
    NetWorthService,
  ],
  exports: [NetWorthService],
})
export class NetWorthModule {} 