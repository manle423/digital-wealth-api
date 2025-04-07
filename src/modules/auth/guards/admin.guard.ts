import { CanActivate } from "@nestjs/common";
import { UserRole } from "@/modules/user/enums/user-role.enum";
import { Injectable } from "@nestjs/common";
import { ExecutionContext } from "@nestjs/common";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return request.user && request.user.role === UserRole.ADMIN;
  }
}