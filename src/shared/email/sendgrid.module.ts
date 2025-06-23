import { Global, Module } from '@nestjs/common';
import { SendGridService } from './sendgrid.service';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@/shared/logger/logger.module';

@Global()
@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [SendGridService],
  exports: [SendGridService],
})
export class SendGridModule {}