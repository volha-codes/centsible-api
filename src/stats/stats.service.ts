import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OverviewQuery } from './dto/overview.query';
import { currentBalance, monthBounds, summarizeMonths } from './overview';

const RECENT_LIMIT = 5;

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(userId: string, { month, currency }: OverviewQuery) {
    const { end, chartStart } = monthBounds(month);

    const [accounts, categories] = await Promise.all([
      this.prisma.account.findMany({
        where: { userId, currency },
        select: { id: true, startingBalance: true },
      }),
      this.prisma.category.findMany({
        where: { userId },
        select: { id: true, type: true },
      }),
    ]);

    const accountIds = accounts.map((a) => a.id);
    const typeByCategory = new Map(categories.map((c) => [c.id, c.type]));
    const where = { userId, accountId: { in: accountIds } };

    const [windowTransactions, sums, recent] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { ...where, date: { gte: chartStart, lt: end } },
        select: { amount: true, date: true, categoryId: true },
      }),
      this.prisma.transaction.groupBy({
        by: ['categoryId'],
        where: { ...where, date: { lt: end } },
        _sum: { amount: true },
      }),
      this.prisma.transaction.findMany({
        where: { ...where, date: { lt: end } },
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        take: RECENT_LIMIT,
      }),
    ]);

    const startingBalance = accounts.reduce(
      (total, a) => total + a.startingBalance,
      0,
    );
    const balance = currentBalance(
      startingBalance,
      sums.map((row) => ({
        categoryId: row.categoryId,
        amount: row._sum.amount ?? 0,
      })),
      typeByCategory,
    );
    const summary = summarizeMonths(month, windowTransactions, typeByCategory);

    return {
      month,
      currency,
      balance,
      previousBalance: balance - (summary.income - summary.expense),
      ...summary,
      recent,
    };
  }
}
