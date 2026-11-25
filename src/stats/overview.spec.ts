import type { CategoryType } from '@prisma/client';
import {
  chartMonthKeys,
  currentBalance,
  monthBounds,
  summarizeMonths,
} from './overview';

const types = new Map<string, CategoryType>([
  ['salary', 'income'],
  ['food', 'expense'],
  ['rent', 'expense'],
]);

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

describe('overview', () => {
  describe('monthBounds', () => {
    it('covers the month and starts the chart five months earlier', () => {
      const { start, end, chartStart } = monthBounds('2026-11');

      expect(start.toISOString()).toBe('2026-11-01T00:00:00.000Z');
      expect(end.toISOString()).toBe('2026-12-01T00:00:00.000Z');
      expect(chartStart.toISOString()).toBe('2026-06-01T00:00:00.000Z');
    });

    it('crosses the year boundary', () => {
      const { end, chartStart } = monthBounds('2026-12');

      expect(end.toISOString()).toBe('2027-01-01T00:00:00.000Z');
      expect(chartStart.toISOString()).toBe('2026-07-01T00:00:00.000Z');
      expect(monthBounds('2026-02').chartStart.toISOString()).toBe(
        '2025-09-01T00:00:00.000Z',
      );
    });
  });

  it('lists six month keys, oldest first', () => {
    expect(chartMonthKeys('2026-02')).toEqual([
      '2025-09',
      '2025-10',
      '2025-11',
      '2025-12',
      '2026-01',
      '2026-02',
    ]);
  });

  describe('currentBalance', () => {
    it('adds income, subtracts expenses and ignores unknown categories', () => {
      const balance = currentBalance(
        1000,
        [
          { categoryId: 'salary', amount: 5000 },
          { categoryId: 'food', amount: 700 },
          { categoryId: 'deleted', amount: 999 },
        ],
        types,
      );

      expect(balance).toBe(5300);
    });
  });

  describe('summarizeMonths', () => {
    const transactions = [
      { amount: 5000, date: day('2026-11-01'), categoryId: 'salary' },
      { amount: 300, date: day('2026-11-30'), categoryId: 'food' },
      { amount: 200, date: day('2026-11-10'), categoryId: 'food' },
      { amount: 900, date: day('2026-11-02'), categoryId: 'rent' },
      { amount: 4000, date: day('2026-10-31'), categoryId: 'salary' },
      { amount: 1000, date: day('2026-10-15'), categoryId: 'rent' },
      { amount: 123, date: day('2026-05-31'), categoryId: 'food' },
    ];

    const result = summarizeMonths('2026-11', transactions, types);

    it('totals the selected month and the one before it', () => {
      expect(result.income).toBe(5000);
      expect(result.expense).toBe(1400);
      expect(result.previousIncome).toBe(4000);
      expect(result.previousExpense).toBe(1000);
    });

    it('gives six buckets with zeros for empty months and skips older ones', () => {
      expect(result.monthly.map((b) => b.month)).toEqual(
        chartMonthKeys('2026-11'),
      );
      expect(result.monthly[0]).toEqual({
        month: '2026-06',
        income: 0,
        expense: 0,
        categories: [],
      });
    });

    it('lists what each month was made of, biggest first', () => {
      expect(result.monthly[5].categories).toEqual([
        { categoryId: 'salary', amount: 5000 },
        { categoryId: 'rent', amount: 900 },
        { categoryId: 'food', amount: 500 },
      ]);
      expect(result.monthly[4].categories).toEqual([
        { categoryId: 'salary', amount: 4000 },
        { categoryId: 'rent', amount: 1000 },
      ]);
    });

    it('sums expenses by category for the selected month, biggest first', () => {
      expect(result.byCategory).toEqual([
        { categoryId: 'rent', amount: 900 },
        { categoryId: 'food', amount: 500 },
      ]);
    });
  });
});
