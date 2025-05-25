import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from '@/modules/user/user.module';
import { OtpService } from './services/otp.service';
import { UserAuthService } from './services/user-auth.service';
import { SessionTrackerService } from './services/session-tracker.service';
import { SessionValidationMiddleware } from './middleware/session-validation.middleware';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtService, 
    OtpService, 
    UserAuthService, 
    SessionTrackerService,
    SessionValidationMiddleware
  ],
  exports: [SessionTrackerService, SessionValidationMiddleware, UserAuthService, JwtService],
})
export class AuthModule {}
