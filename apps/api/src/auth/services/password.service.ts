import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordService {
  constructor(private readonly configService: ConfigService) {}

  async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: this.configService.get<number>('ARGON2_MEMORY_COST', 19456),
      timeCost: this.configService.get<number>('ARGON2_TIME_COST', 2),
      parallelism: this.configService.get<number>('ARGON2_PARALLELISM', 1),
    });
  }

  async verify(passwordHash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(passwordHash, password);
    } catch {
      return false;
    }
  }
}
