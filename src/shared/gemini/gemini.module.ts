import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import { LoggerModule } from '../logger/logger.module';

@Global()
@Module({
  imports: [
    ConfigModule,
    LoggerModule,
  ],
  providers: [GeminiService],
  exports: [GeminiService],
})
export class GeminiModule {} 