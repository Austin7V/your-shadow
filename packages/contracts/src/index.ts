export const APP_NAME = "Your Shadow" as const;

export type ApiMessage = {
  message: string;
};

export type AuthUser = {
  id: string;
  email: string;
  status: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  isAdultConfirmed: boolean;
};

export type RegisterResponse = AuthUser & {
  createdAt: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = AuthUser;

export type CurrentUserResponse = AuthUser;
