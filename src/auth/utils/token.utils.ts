import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { IJwtPayload, ITokens } from '../types/auth.types';

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
