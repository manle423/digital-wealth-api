import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { IJwtPayload, ITokens } from '../types/auth.types';
import { Request } from 'express';

export async function generateTokens(
  jwtService: JwtService,
  payload: IJwtPayload,
): Promise<ITokens> {
  const accessTokenExpiresIn = Number(process.env.JWT_EXPIRES_IN);
  const refreshTokenExpiresIn = Number(process.env.JWT_REFRESH_EXPIRES_IN);

  const accessTokenExpiresAt = Date.now() + accessTokenExpiresIn;
  const refreshTokenExpiresAt = Date.now() + refreshTokenExpiresIn;

  const [accessToken, refreshToken] = await Promise.all([
    jwtService.signAsync(payload, {
      expiresIn: accessTokenExpiresIn / 1000,
      secret: process.env.JWT_SECRET_KEY,
    }),
    jwtService.signAsync(payload, {
      expiresIn: refreshTokenExpiresIn / 1000,
      secret: process.env.JWT_REFRESH_TOKEN_KEY,
    }),
  ]);

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
  };
}

export function setCookies(res: Response, tokens: ITokens): void {
  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(tokens.accessTokenExpiresAt),
  });

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(tokens.refreshTokenExpiresAt),
  });
}

export function clearCookies(res: Response): void {
  res.cookie('accessToken', '', {
    maxAge: 0,
    httpOnly: true,
  });
  res.cookie('refreshToken', '', {
    maxAge: 0,
    httpOnly: true,
  });
}

// Utility function để extract token từ request (tái sử dụng cho JwtGuard và middleware)
export function extractTokenFromRequest(request: Request): string | undefined {
  // Try to get token from cookie first (ưu tiên cookie)
  const cookieToken = request.cookies?.accessToken;
  if (cookieToken) {
    return cookieToken;
  }

  // Fallback to Authorization header
  const [type, token] = request.headers.authorization?.split(' ') ?? [];
  return type === 'Bearer' ? token : undefined;
}

// Helper function để verify access token
export async function verifyAccessToken(
  jwtService: JwtService,
  token: string,
): Promise<IJwtPayload> {
  return (await jwtService.verifyAsync(token, {
    secret: process.env.JWT_SECRET_KEY,
  })) as IJwtPayload;
}
