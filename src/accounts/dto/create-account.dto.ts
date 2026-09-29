import { IsNumber, IsString, MinLength } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  currency: string;

  @IsNumber()
  startingBalance: number;
}
