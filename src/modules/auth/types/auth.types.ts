export interface IJwtPayload {
  sub: string;
  email: string;
  role?: string;
  sessionId?: string;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
}

export interface IAuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  tokens: ITokens;
}
