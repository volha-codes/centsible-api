import { IsInt, IsString, Max, Min, MinLength } from 'class-validator';

export const MAX_BALANCE = 2_000_000_000;

export class CreateAccountDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  currency: string;

  @IsInt()
  @Min(-MAX_BALANCE)
  @Max(MAX_BALANCE)
  startingBalance: number;
}
