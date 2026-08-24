import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStatus } from '../../users/enums/user-status.enum';
import { RefreshToken } from '../entities/refresh-token.entity';
import { AuthTokenService } from './auth-token.service';

const INVALID_REFRESH_TOKEN_MESSAGE = 'Invalid or expired refresh token';

export interface RefreshedAuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthSessionService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokensRepository: Repository<RefreshToken>,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async refresh(
    rawRefreshToken: string | undefined,
  ): Promise<RefreshedAuthTokens> {
    if (!rawRefreshToken) {
      throw new UnauthorizedException(INVALID_REFRESH_TOKEN_MESSAGE);
    }

    const tokenHash = this.authTokenService.hashRefreshToken(rawRefreshToken);

    const storedRefreshToken = await this.refreshTokensRepository.findOne({
      where: {
        tokenHash,
      },
      relations: {
        user: true,
      },
    });

    if (
      !storedRefreshToken ||
      storedRefreshToken.revokedAt !== null ||
      storedRefreshToken.expiresAt.getTime() <= Date.now() ||
      storedRefreshToken.user.status !== UserStatus.ACTIVE
    ) {
      throw new UnauthorizedException(INVALID_REFRESH_TOKEN_MESSAGE);
    }

    const issuedTokens = await this.authTokenService.issue(
      storedRefreshToken.userId,
    );

    storedRefreshToken.revokedAt = new Date();

    await this.refreshTokensRepository.save(storedRefreshToken);

    const newRefreshToken = this.refreshTokensRepository.create({
      tokenHash: issuedTokens.refreshTokenHash,
      expiresAt: issuedTokens.refreshTokenExpiresAt,
      userId: storedRefreshToken.userId,
    });

    await this.refreshTokensRepository.save(newRefreshToken);

    return {
      accessToken: issuedTokens.accessToken,
      refreshToken: issuedTokens.refreshToken,
    };
  }

  async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) {
      return;
    }

    const tokenHash = this.authTokenService.hashRefreshToken(rawRefreshToken);

    const storedRefreshToken = await this.refreshTokensRepository.findOneBy({
      tokenHash,
    });

    if (!storedRefreshToken || storedRefreshToken.revokedAt !== null) {
      return;
    }

    storedRefreshToken.revokedAt = new Date();

    await this.refreshTokensRepository.save(storedRefreshToken);
  }
}
