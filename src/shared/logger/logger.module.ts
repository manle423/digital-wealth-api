import { Global, Module } from '@nestjs/common'
import { LoggerService } from './logger.service'
import { LoggerProvider } from './logger.provider'

@Global()
@Module({
  providers: [LoggerProvider, LoggerService],
  exports: [LoggerService],
})
export class LoggerModule { }
