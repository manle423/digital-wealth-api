import { CanActivate, ForbiddenException } from "@nestjs/common";
import { UserRole } from "@/modules/user/enums/user-role.enum";
import { Injectable } from "@nestjs/common";
import { ExecutionContext } from "@nestjs/common";
import { AuthError } from "../enum/error.enum";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    if (!request.user) {
      throw new ForbiddenException(AuthError.USER_NOT_VERIFIED);
    }
    
    if (request.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(AuthError.FORBIDDEN);
    }
    
    return true;
  }
}