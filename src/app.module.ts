import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { LoggerModule } from './shared/logger/logger.module';
import AppConfig from './config/config-maps/app.config-maps'
import { AppConfigModule } from './config/config.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [AppConfig]
    }),
    AppConfigModule.load(),
    UserModule, 
    AuthModule,
    LoggerModule
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
