import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Redis } from 'ioredis'

@Injectable()
export class RedisService {
  constructor(
    @Inject('IOREDIS_CLIENT') private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) { }

  async onModuleDestroy() {
    this.redis.disconnect(false)
  }

  buildKey(key: string): string {
    const prefix = this.configService.get('redis.prefix')

    return `${prefix}_${key}`
  }

  get(key: string) {
    return this.redis.get(this.buildKey(key))
  }

  set(key: string, value: string, ttl: number) {
    return this.redis.set(this.buildKey(key), value, 'EX', ttl)
  }

  async del(key: string) {
    return await this.redis.del(this.buildKey(key))
  }

  async delWithPrefix(prefix: string) {
    // Build the prefix with Redis prefix
    const builtPrefix = this.buildKey(prefix)
    
    // Find all keys matching the built prefix
    const keys = await this.redis.keys(`${builtPrefix}*`)

    if (!keys.length) {
      return
    }

    // Delete all found keys
    return await this.redis.del(keys)
  }
}
