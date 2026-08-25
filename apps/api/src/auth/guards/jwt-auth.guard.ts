import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { AccessTokenPayload } from '../types/access-token-payload.type';
import { AuthenticatedUser } from '../types/authenticated-request.type';
import { getAccessTokenCookie } from '../utils/access-token-cookie.util';

const AUTHENTICATION_REQUIRED_MESSAGE = 'Authentication required';

type RequestWithAuthentication = Request & {
  auth?: AuthenticatedUser;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithAuthentication>();

    const accessToken = getAccessTokenCookie(request);

    if (!accessToken) {
      throw new UnauthorizedException(AUTHENTICATION_REQUIRED_MESSAGE);
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<AccessTokenPayload>(accessToken);

      if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
        throw new UnauthorizedException(AUTHENTICATION_REQUIRED_MESSAGE);
      }

      request.auth = {
        userId: payload.sub,
      };

      return true;
    } catch {
      throw new UnauthorizedException(AUTHENTICATION_REQUIRED_MESSAGE);
    }
  }
}
