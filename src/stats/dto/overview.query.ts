import { IsString, Length, Matches } from 'class-validator';

export class OverviewQuery {
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'month must look like 2026-11',
  })
  month: string;

  @IsString()
  @Length(3, 3)
  currency: string;
}
