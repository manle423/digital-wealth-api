import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MysqldbConnection } from './connections/db.connection'

@Module({
  imports: [
    TypeOrmModule.forRootAsync(MysqldbConnection),
  ],
})
export class MysqlDbModule { }
