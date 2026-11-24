import {
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export const MAX_AMOUNT = 2_000_000_000;

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsInt()
  @Min(1)
  @Max(MAX_AMOUNT)
  amount: number;

  @IsISO8601()
  date: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}
