import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from '@/modules/user/user.module';
import { OtpService } from './services/otp.service';
import { UserAuthService } from './services/user-auth.service';
import { SessionTrackerService } from './services/session-tracker.service';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtService, 
    OtpService, 
    UserAuthService, 
    SessionTrackerService
  ],
  exports: [SessionTrackerService],
})
export class AuthModule {}
