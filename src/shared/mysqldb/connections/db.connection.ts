import { DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { join } from 'path';

const CONNECTION_NAME = 'MYSQLDB';
export const MysqldbConnection: TypeOrmModuleAsyncOptions = {
  name: CONNECTION_NAME,
  useFactory: (configService: ConfigService) => {
    const options: TypeOrmModuleOptions & DataSourceOptions = {
      name: CONNECTION_NAME,
      type: 'mysql',
      host: configService.get('mysqldb.host'),
      port: parseInt(configService.get('mysqldb.port'), 10),
      username: configService.get('mysqldb.username'),
      password: configService.get('mysqldb.password'),
      database: configService.get('mysqldb.database'),
      entities: [join(__dirname, '../../../**/entities/*.entity{.ts,.js}')],
      synchronize: false,
      autoLoadEntities: true,
      namingStrategy: new SnakeNamingStrategy(),
    };

    return options;
  },
  inject: [ConfigService],
};
