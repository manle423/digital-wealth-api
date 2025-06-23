import { Global, Module } from '@nestjs/common';
import { ResendService } from './resend.service';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@/shared/logger/logger.module';

@Global()
@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [ResendService],
  exports: [ResendService],
})
export class ResendModule {}
