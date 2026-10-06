import { CategoryType } from '@prisma/client';
import { IsString, MinLength, IsEnum } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  icon: string;

  @IsString()
  @MinLength(1)
  color: string;

  @IsEnum(CategoryType)
  type: CategoryType;
}
