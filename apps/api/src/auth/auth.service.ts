import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserStatus } from '../users/enums/user-status.enum';
import { LoginDto } from './dto/login.dto';
import { LoginResult } from './dto/login-response.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { AuthTokenService } from './services/auth-token.service';
import { PasswordService } from './services/password.service';

const REGISTRATION_CONFLICT_MESSAGE =
  'Unable to create account with the provided details';

const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(RefreshToken)
    private readonly refreshTokensRepository: Repository<RefreshToken>,

    private readonly passwordService: PasswordService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const email = registerDto.email.trim().toLowerCase();

    const userAlreadyExists = await this.usersRepository.existsBy({
      emailNormalized: email,
    });

    if (userAlreadyExists) {
      throw new ConflictException(REGISTRATION_CONFLICT_MESSAGE);
    }

    const passwordHash = await this.passwordService.hash(registerDto.password);

    const user = this.usersRepository.create({
      email,
      emailNormalized: email,
      passwordHash,
    });

    try {
      const savedUser = await this.usersRepository.save(user);

      return {
        id: savedUser.id,
        email: savedUser.email,
        status: savedUser.status,
        createdAt: savedUser.createdAt,
      };
    } catch (error: unknown) {
      if (this.isUniqueConstraintViolation(error)) {
        throw new ConflictException(REGISTRATION_CONFLICT_MESSAGE);
      }

      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResult> {
    const email = loginDto.email.trim().toLowerCase();

    const user = await this.usersRepository.findOne({
      where: {
        emailNormalized: email,
      },
      select: {
        id: true,
        email: true,
        emailNormalized: true,
        passwordHash: true,
        status: true,
      },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const passwordIsValid = await this.passwordService.verify(
      user.passwordHash,
      loginDto.password,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const tokens = await this.authTokenService.issue(user.id);

    const refreshToken = this.refreshTokensRepository.create({
      tokenHash: tokens.refreshTokenHash,
      expiresAt: tokens.refreshTokenExpiresAt,
      userId: user.id,
    });

    await this.refreshTokensRepository.save(refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private isUniqueConstraintViolation(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    const databaseError = error as {
      code?: string;
      driverError?: {
        code?: string;
      };
    };

    return (
      databaseError.code === '23505' ||
      databaseError.driverError?.code === '23505'
    );
  }
}
