import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { IORedisClientProvider } from './redis.provider';

@Global()
@Module({
  providers: [IORedisClientProvider, RedisService],
  exports: [RedisService],
})
export class RedisModule {}
