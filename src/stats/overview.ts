import type { CategoryType } from '@prisma/client';
import { signedAmount } from 'src/transactions/signed-amount';

export const CHART_MONTHS = 6;

export interface OverviewTransaction {
  amount: number;
  date: Date;
  categoryId: string;
}

export interface CategoryTotal {
  categoryId: string;
  amount: number;
}

export interface MonthBucket {
  month: string;
  income: number;
  expense: number;
  categories: CategoryTotal[];
}

function sortedTotals(totals: Map<string, number>): CategoryTotal[] {
  return [...totals.entries()]
    .map(([categoryId, amount]) => ({ categoryId, amount }))
    .sort((a, b) => b.amount - a.amount);
}

function parseMonth(month: string) {
  const [year, number] = month.split('-').map(Number);
  return { year, monthIndex: number - 1 };
}

export function monthBounds(month: string) {
  const { year, monthIndex } = parseMonth(month);

  return {
    start: new Date(Date.UTC(year, monthIndex, 1)),
    end: new Date(Date.UTC(year, monthIndex + 1, 1)),
    chartStart: new Date(Date.UTC(year, monthIndex - (CHART_MONTHS - 1), 1)),
  };
}

export function chartMonthKeys(month: string): string[] {
  const { year, monthIndex } = parseMonth(month);

  return Array.from({ length: CHART_MONTHS }, (_, i) =>
    new Date(Date.UTC(year, monthIndex - (CHART_MONTHS - 1 - i), 1))
      .toISOString()
      .slice(0, 7),
  );
}

export function currentBalance(
  startingBalance: number,
  sums: CategoryTotal[],
  typeByCategory: Map<string, CategoryType>,
): number {
  let balance = startingBalance;

  for (const { categoryId, amount } of sums) {
    const type = typeByCategory.get(categoryId);
    if (type) balance += signedAmount(type, amount);
  }

  return balance;
}

export function summarizeMonths(
  month: string,
  transactions: OverviewTransaction[],
  typeByCategory: Map<string, CategoryType>,
) {
  const keys = chartMonthKeys(month);
  const monthly = new Map<string, MonthBucket>(
    keys.map((key) => [
      key,
      { month: key, income: 0, expense: 0, categories: [] },
    ]),
  );
  const categoriesByMonth = new Map<string, Map<string, number>>(
    keys.map((key) => [key, new Map()]),
  );
  const expenseByCategory = new Map<string, number>();

  for (const { amount, date, categoryId } of transactions) {
    const type = typeByCategory.get(categoryId);
    const key = date.toISOString().slice(0, 7);
    const bucket = monthly.get(key);
    if (!type || !bucket) continue;

    const monthCategories = categoriesByMonth.get(key)!;
    monthCategories.set(
      categoryId,
      (monthCategories.get(categoryId) ?? 0) + amount,
    );

    if (type === 'income') {
      bucket.income += amount;
    } else {
      bucket.expense += amount;

      if (key === month) {
        expenseByCategory.set(
          categoryId,
          (expenseByCategory.get(categoryId) ?? 0) + amount,
        );
      }
    }
  }

  const buckets = keys.map((key) => ({
    ...monthly.get(key)!,
    categories: sortedTotals(categoriesByMonth.get(key)!),
  }));
  const thisMonth = buckets[buckets.length - 1];
  const lastMonth = buckets[buckets.length - 2];

  return {
    income: thisMonth.income,
    expense: thisMonth.expense,
    previousIncome: lastMonth.income,
    previousExpense: lastMonth.expense,
    monthly: buckets,
    byCategory: sortedTotals(expenseByCategory),
  };
}
