import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// Decorator để lấy session info từ request
export const SessionInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as any;

    return {
      sessionId: user?.sessionId,
      userId: user?.sub,
      email: user?.email,
      role: user?.role,
    };
  },
);

// Decorator để lấy current user với session info
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user;
  },
);
