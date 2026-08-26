import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DataEncryptionService } from './services/data-encryption.service';

@Module({
  imports: [ConfigModule],
  providers: [DataEncryptionService],
  exports: [DataEncryptionService],
})
export class SecurityModule {}
