import {
  Equals,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class DeleteAccountDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/\S/, {
    message: 'password must contain a non-whitespace character',
  })
  password!: string;

  @IsString()
  @Equals('DELETE', {
    message: 'confirmation must equal DELETE',
  })
  confirmation!: string;
}
