import type { CategoryType } from '@prisma/client';

export function signedAmount(type: CategoryType, amount: number): number {
  return type === 'income' ? amount : -amount;
}
