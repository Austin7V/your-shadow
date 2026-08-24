import { UserStatus } from '../../users/enums/user-status.enum';

export class RegisterResponseDto {
  id!: string;
  email!: string;
  status!: UserStatus;
  createdAt!: Date;
}
