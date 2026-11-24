import type { CategoryType } from '@prisma/client';

export interface DemoCategory {
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
}

export interface DemoAccount {
  name: string;
  currency: string;
  startingBalance: number;
}

export interface DemoTransaction {
  account: string;
  category: string;
  amount: number;
  date: Date;
  note: string;
}

export const MAIN = 'Main Account';
export const SAVINGS = 'Savings';
export const CASH = 'Travel Cash';

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { name: MAIN, currency: 'PLN', startingBalance: 850000 },
  { name: SAVINGS, currency: 'EUR', startingBalance: 320000 },
  { name: CASH, currency: 'USD', startingBalance: 50000 },
];

export const DEMO_CATEGORIES: DemoCategory[] = [
  {
    name: 'Food & Dining',
    icon: 'shopping-cart',
    color: 'red',
    type: 'expense',
  },
  { name: 'Transport', icon: 'car', color: 'amber', type: 'expense' },
  { name: 'Rent & Home', icon: 'house', color: 'teal', type: 'expense' },
  {
    name: 'Entertainment',
    icon: 'clapperboard',
    color: 'purple',
    type: 'expense',
  },
  { name: 'Health', icon: 'pill', color: 'pink', type: 'expense' },
  { name: 'Shopping', icon: 'shopping-bag', color: 'orange', type: 'expense' },
  { name: 'Travel', icon: 'plane', color: 'blue', type: 'expense' },
  { name: 'Subscriptions', icon: 'smartphone', color: 'blue', type: 'expense' },
  { name: 'Coffee', icon: 'coffee', color: 'amber', type: 'expense' },
  { name: 'Salary', icon: 'briefcase', color: 'lime', type: 'income' },
  { name: 'Freelance', icon: 'book-open', color: 'teal', type: 'income' },
  { name: 'Gifts', icon: 'gift', color: 'pink', type: 'income' },
];

const DAY_MS = 86_400_000;

const cents = (amount: number) => Math.round(amount * 100);

interface MonthlyEntry {
  account: string;
  category: string;
  amount: number;
  day: number;
  note: string;
  monthsAgo?: number[];
}

const MONTHLY: MonthlyEntry[] = [
  { account: MAIN, category: 'Salary', amount: 9800, day: 10, note: 'Salary' },
  {
    account: MAIN,
    category: 'Rent & Home',
    amount: 2400,
    day: 5,
    note: 'Rent',
  },
  {
    account: MAIN,
    category: 'Rent & Home',
    amount: 312.4,
    day: 12,
    note: 'Electricity and internet',
  },
  {
    account: MAIN,
    category: 'Subscriptions',
    amount: 43,
    day: 3,
    note: 'Netflix',
  },
  {
    account: MAIN,
    category: 'Subscriptions',
    amount: 19.99,
    day: 8,
    note: 'Spotify',
  },
  {
    account: MAIN,
    category: 'Health',
    amount: 149,
    day: 2,
    note: 'Gym membership',
  },
  {
    account: SAVINGS,
    category: 'Freelance',
    amount: 450,
    day: 18,
    note: 'Logo design',
    monthsAgo: [1],
  },
  {
    account: SAVINGS,
    category: 'Freelance',
    amount: 620,
    day: 22,
    note: 'Landing page',
    monthsAgo: [2],
  },
  {
    account: SAVINGS,
    category: 'Freelance',
    amount: 300,
    day: 15,
    note: 'Website fixes',
    monthsAgo: [3],
  },
];

const MONTHS_BACK = [0, 1, 2, 3];

type Everyday = [
  daysAgo: number,
  account: string,
  category: string,
  amount: number,
  note: string,
];

const EVERYDAY: Everyday[] = [
  [0, MAIN, 'Food & Dining', 84.3, 'Biedronka'],
  [0, MAIN, 'Coffee', 14, 'Flat white'],
  [1, MAIN, 'Transport', 31, 'Metro card top-up'],
  [1, MAIN, 'Food & Dining', 42.5, 'Lunch'],
  [2, MAIN, 'Entertainment', 56, 'Cinema tickets'],
  [2, MAIN, 'Coffee', 15, 'Latte'],
  [3, MAIN, 'Shopping', 329, 'Sneakers'],
  [4, MAIN, 'Food & Dining', 127.45, 'Lidl'],
  [5, MAIN, 'Transport', 28.9, 'Uber'],
  [7, MAIN, 'Health', 63.2, 'Pharmacy'],
  [8, MAIN, 'Food & Dining', 156, 'Dinner with friends'],
  [9, MAIN, 'Coffee', 54, 'Coffee beans'],
  [11, MAIN, 'Shopping', 89.9, 'Books'],
  [12, MAIN, 'Food & Dining', 98.75, 'Biedronka'],
  [14, MAIN, 'Transport', 79, 'Train to Kraków'],
  [15, MAIN, 'Entertainment', 240, 'Concert tickets'],
  [17, MAIN, 'Food & Dining', 63, 'Farmers market'],
  [19, MAIN, 'Health', 280, 'Dentist'],
  [21, MAIN, 'Food & Dining', 143.1, 'Lidl'],
  [23, MAIN, 'Transport', 215, 'Fuel'],
  [25, MAIN, 'Entertainment', 119, 'Board game'],
  [27, MAIN, 'Food & Dining', 187, 'Restaurant'],
  [30, MAIN, 'Shopping', 459, 'Winter jacket'],
  [33, MAIN, 'Food & Dining', 112.6, 'Biedronka'],
  [36, MAIN, 'Gifts', 200, 'Birthday gift'],
  [38, MAIN, 'Travel', 612, 'Flight to Lisbon'],
  [40, CASH, 'Travel', 35, 'Souvenirs'],
  [41, CASH, 'Transport', 18, 'Taxi'],
  [41, MAIN, 'Food & Dining', 134.2, 'Groceries'],
  [45, MAIN, 'Transport', 41.5, 'Uber'],
  [50, MAIN, 'Entertainment', 130, 'Theatre'],
  [55, MAIN, 'Food & Dining', 119.9, 'Lidl'],
  [60, MAIN, 'Health', 47.8, 'Pharmacy'],
  [66, MAIN, 'Shopping', 289, 'Headphones'],
  [72, MAIN, 'Food & Dining', 101.3, 'Groceries'],
  [80, SAVINGS, 'Travel', 220, 'Hotel in Lisbon'],
];

export function buildDemoTransactions(now: Date): DemoTransaction[] {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const today = Date.UTC(year, month, now.getUTCDate());
  const result: DemoTransaction[] = [];

  for (const monthsAgo of MONTHS_BACK) {
    for (const entry of MONTHLY) {
      if (entry.monthsAgo && !entry.monthsAgo.includes(monthsAgo)) continue;

      const date = new Date(Date.UTC(year, month - monthsAgo, entry.day));
      if (date.getTime() > today) continue;

      result.push({
        account: entry.account,
        category: entry.category,
        amount: cents(entry.amount),
        date,
        note: entry.note,
      });
    }
  }

  for (const [daysAgo, account, category, amount, note] of EVERYDAY) {
    result.push({
      account,
      category,
      amount: cents(amount),
      date: new Date(today - daysAgo * DAY_MS),
      note,
    });
  }

  return result;
}

export function buildDemoData(now: Date) {
  return {
    accounts: DEMO_ACCOUNTS,
    categories: DEMO_CATEGORIES,
    transactions: buildDemoTransactions(now),
  };
}
