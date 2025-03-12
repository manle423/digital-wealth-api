import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { IJwtPayload, ITokens } from '../types/auth.types';

export async function generateTokens(jwtService: JwtService, payload: IJwtPayload): Promise<ITokens> {
  const [accessToken, refreshToken] = await Promise.all([
    jwtService.signAsync(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN,
      secret: process.env.JWT_SECRET_KEY,
    }),
    jwtService.signAsync(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
      secret: process.env.JWT_REFRESH_TOKEN_KEY,
    }),
  ]);

  return {
    accessToken,
    refreshToken,
  };
}

export function setCookies(res: Response, tokens: ITokens): void {
  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(Date.now() + Number(process.env.JWT_EXPIRES_IN)),
  });

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(Date.now() + Number(process.env.JWT_REFRESH_EXPIRES_IN)),
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