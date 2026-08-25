import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserStatus } from '../../users/enums/user-status.enum';
import { CurrentUserResponseDto } from '../dto/current-user-response.dto';

const AUTHENTICATION_REQUIRED_MESSAGE = 'Authentication required';

@Injectable()
export class CurrentUserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getById(userId: string): Promise<CurrentUserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(AUTHENTICATION_REQUIRED_MESSAGE);
    }

    return {
      id: user.id,
      email: user.email,
      status: user.status,
      createdAt: user.createdAt,
    };
  }
}
