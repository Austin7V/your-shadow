import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AccountDeletionService } from './services/account-deletion.service';
import { AuthCookieService } from './services/auth-cookie.service';
import { AuthSessionService } from './services/auth-session.service';
import type { AuthenticatedRequest } from './types/authenticated-request.type';
import { getRefreshTokenCookie } from './utils/refresh-token-cookie.util';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authSessionService: AuthSessionService,
    private readonly authCookieService: AuthCookieService,
    private readonly accountDeletionService: AccountDeletionService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: RegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    const result = await this.authService.login(loginDto);

    this.authCookieService.setAuthenticationCookies(
      response,
      result.accessToken,
      result.refreshToken,
    );

    return result.user;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.NO_CONTENT)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const refreshToken = getRefreshTokenCookie(request);

    try {
      const tokens = await this.authSessionService.refresh(refreshToken);

      this.authCookieService.setAuthenticationCookies(
        response,
        tokens.accessToken,
        tokens.refreshToken,
      );
    } catch (error: unknown) {
      this.authCookieService.clearAuthenticationCookies(response);

      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const refreshToken = getRefreshTokenCookie(request);

    try {
      await this.authSessionService.logout(refreshToken);
    } finally {
      this.authCookieService.clearAuthenticationCookies(response);
    }
  }

  @Delete('account')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async deleteAccount(
    @Req() request: AuthenticatedRequest,
    @Body() deleteAccountDto: DeleteAccountDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.accountDeletionService.deleteAccount(
      request.auth.userId,
      deleteAccountDto.password,
    );

    this.authCookieService.clearAuthenticationCookies(response);
  }
}
