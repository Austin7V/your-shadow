import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { PasswordService } from './services/password.service';

const REGISTRATION_CONFLICT_MESSAGE =
  'Unable to create account with the provided details';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly passwordService: PasswordService,
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
