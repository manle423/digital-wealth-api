export interface IJwtPayload {
  sub: number;
  email: string;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthResponse {
  user: {
    id: number;
    email: string;
    name: string;
  };
  tokens: ITokens;
} 