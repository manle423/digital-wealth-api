import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NetWorthSnapshot } from '../entities/net-worth-snapshot.entity';
import { MysqldbRepository } from '@/shared/mysqldb/mysqldb.repository';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';

@Injectable()
export class NetWorthSnapshotRepository extends MysqldbRepository<NetWorthSnapshot> {
  constructor(
    @InjectRepository(NetWorthSnapshot, MysqldbConnection.name)
    repository: Repository<NetWorthSnapshot>,
  ) {
    super(repository);
  }
}