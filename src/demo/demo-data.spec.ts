import {
  buildDemoData,
  CASH,
  DEMO_ACCOUNTS,
  DEMO_CATEGORIES,
  MAIN,
  SAVINGS,
} from './demo-data';

const TODAYS = [
  new Date(Date.UTC(2026, 10, 2)),
  new Date(Date.UTC(2026, 11, 31)),
  new Date(Date.UTC(2027, 0, 1)),
  new Date(Date.UTC(2027, 2, 15)),
];

describe('demo data', () => {
  it('has unique category names, so transactions can refer to them by name', () => {
    const names = DEMO_CATEGORIES.map((c) => c.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('has three accounts in three currencies', () => {
    expect(DEMO_ACCOUNTS.map((a) => a.currency).sort()).toEqual([
      'EUR',
      'PLN',
      'USD',
    ]);
  });

  describe.each(TODAYS.map((d) => [d.toISOString().slice(0, 10), d] as const))(
    'for %s',
    (_label, today) => {
      const { transactions } = buildDemoData(today);
      const accountNames = new Set(DEMO_ACCOUNTS.map((a) => a.name));
      const categoryByName = new Map(DEMO_CATEGORIES.map((c) => [c.name, c]));

      it('only refers to known accounts and categories', () => {
        for (const t of transactions) {
          expect(accountNames.has(t.account)).toBe(true);
          expect(categoryByName.has(t.category)).toBe(true);
        }
      });

      it('has positive whole-cent amounts', () => {
        for (const t of transactions) {
          expect(Number.isInteger(t.amount)).toBe(true);
          expect(t.amount).toBeGreaterThan(0);
        }
      });

      it('has nothing in the future and has activity today and yesterday', () => {
        const midnight = Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate(),
        );
        const days = new Set(transactions.map((t) => t.date.getTime()));

        expect(Math.max(...days)).toBeLessThanOrEqual(midnight);
        expect(days.has(midnight)).toBe(true);
        expect(days.has(midnight - 86_400_000)).toBe(true);
      });

      it('has income and expenses in each of the previous three months', () => {
        for (let monthsAgo = 1; monthsAgo <= 3; monthsAgo++) {
          const first = Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth() - monthsAgo,
            1,
          );
          const next = Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth() - monthsAgo + 1,
            1,
          );
          const inMonth = transactions.filter(
            (t) => t.date.getTime() >= first && t.date.getTime() < next,
          );
          const types = new Set(
            inMonth.map((t) => categoryByName.get(t.category)?.type),
          );

          expect(types).toEqual(new Set(['income', 'expense']));
        }
      });

      it('keeps every account balance positive', () => {
        for (const account of DEMO_ACCOUNTS) {
          const change = transactions
            .filter((t) => t.account === account.name)
            .reduce(
              (sum, t) =>
                sum +
                (categoryByName.get(t.category)?.type === 'income'
                  ? t.amount
                  : -t.amount),
              0,
            );

          expect(account.startingBalance + change).toBeGreaterThan(0);
        }
      });

      it('uses every account', () => {
        for (const name of [MAIN, SAVINGS, CASH]) {
          expect(transactions.some((t) => t.account === name)).toBe(true);
        }
      });
    },
  );
});
