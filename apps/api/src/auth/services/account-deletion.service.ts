import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PasswordService } from './password.service';

@Injectable()
export class AccountDeletionService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly passwordService: PasswordService,
  ) {}

  async deleteAccount(userId: string, password: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid account credentials');
    }

    const isPasswordValid = await this.passwordService.verify(
      user.passwordHash,
      password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid account credentials');
    }

    await this.usersRepository.delete({
      id: userId,
    });
  }
}
