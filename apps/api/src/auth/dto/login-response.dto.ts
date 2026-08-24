import { UserStatus } from '../../users/enums/user-status.enum';

export class LoginResponseDto {
  id!: string;
  email!: string;
  status!: UserStatus;
}

export interface LoginResult {
  user: LoginResponseDto;
  accessToken: string;
  refreshToken: string;
}
