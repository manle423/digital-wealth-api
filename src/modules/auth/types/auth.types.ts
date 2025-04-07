export interface IJwtPayload {
  sub: string;
  email: string;
  role?: string;
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
  };
  tokens: ITokens;
}
