import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';

export interface IssuedAuthTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenHash: string;
  refreshTokenExpiresAt: Date;
}

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async issue(userId: string): Promise<IssuedAuthTokens> {
    const accessTokenTtlSeconds = this.configService.get<number>(
      'JWT_ACCESS_TTL_SECONDS',
      900,
    );

    const refreshTokenTtlSeconds = this.configService.get<number>(
      'REFRESH_TOKEN_TTL_SECONDS',
      2592000,
    );

    const accessToken = await this.jwtService.signAsync(
      {
        sub: userId,
      },
      {
        expiresIn: accessTokenTtlSeconds,
      },
    );

    const refreshToken = randomBytes(64).toString('base64url');

    const refreshTokenHash = createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const refreshTokenExpiresAt = new Date(
      Date.now() + refreshTokenTtlSeconds * 1000,
    );

    return {
      accessToken,
      refreshToken,
      refreshTokenHash,
      refreshTokenExpiresAt,
    };
  }
}
