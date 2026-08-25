import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CurrentUserController } from './current-user.controller';
import { RefreshToken } from './entities/refresh-token.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthCookieService } from './services/auth-cookie.service';
import { AuthSessionService } from './services/auth-session.service';
import { AuthTokenService } from './services/auth-token.service';
import { CurrentUserService } from './services/current-user.service';
import { PasswordService } from './services/password.service';

@Module({
  imports: [
    ConfigModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      }),
    }),

    TypeOrmModule.forFeature([User, RefreshToken]),
  ],
  controllers: [AuthController, CurrentUserController],
  providers: [
    AuthService,
    AuthCookieService,
    AuthSessionService,
    AuthTokenService,
    CurrentUserService,
    JwtAuthGuard,
    PasswordService,
  ],
})
export class AuthModule {}
