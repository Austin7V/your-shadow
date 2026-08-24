import { Transform, type TransformFnParams } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const normalizeEmailInput = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value;
  }

  return value.trim().toLowerCase();
};

export class RegisterDto {
  @Transform(({ value }: TransformFnParams) => normalizeEmailInput(value))
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/\S/, {
    message: 'password must contain a non-whitespace character',
  })
  password!: string;

  @IsBoolean()
  @Equals(true, {
    message: 'adult confirmation is required',
  })
  isAdultConfirmed!: boolean;
}
