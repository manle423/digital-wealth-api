import { Injectable } from '@nestjs/common';
import { JwtGuard } from './jwt.guard';

@Injectable()
export class OptionalJwtGuard extends JwtGuard {
  handleRequest(err: any, user: any, info: any) {
    // Don't throw an error if no token is provided
    // Just return null/undefined which will result in req.user being undefined
    return user;
  }
}
