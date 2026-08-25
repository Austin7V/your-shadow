import { UserStatus } from '../../users/enums/user-status.enum';

export class CurrentUserResponseDto {
  id!: string;
  email!: string;
  status!: UserStatus;
  createdAt!: Date;
}
