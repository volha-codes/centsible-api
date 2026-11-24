import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { signedAmount } from 'src/transactions/signed-amount';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  private handleError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Account not found');
    }

    throw error;
  }

  private async withBalances<T extends { id: string; startingBalance: number }>(
    userId: string,
    accounts: T[],
  ) {
    if (accounts.length === 0) return [];

    const [sums, categories] = await Promise.all([
      this.prisma.transaction.groupBy({
        by: ['accountId', 'categoryId'],
        where: { userId, accountId: { in: accounts.map((a) => a.id) } },
        _sum: { amount: true },
      }),
      this.prisma.category.findMany({
        where: { userId },
        select: { id: true, type: true },
      }),
    ]);

    const typeById = new Map(categories.map((c) => [c.id, c.type]));
    const changeByAccount = new Map<string, number>();

    for (const row of sums) {
      const type = typeById.get(row.categoryId);
      if (!type) continue;

      const change = signedAmount(type, row._sum.amount ?? 0);
      changeByAccount.set(
        row.accountId,
        (changeByAccount.get(row.accountId) ?? 0) + change,
      );
    }

    return accounts.map((account) => ({
      ...account,
      balance: account.startingBalance + (changeByAccount.get(account.id) ?? 0),
    }));
  }

  private async withBalance<T extends { id: string; startingBalance: number }>(
    userId: string,
    account: T,
  ) {
    const [result] = await this.withBalances(userId, [account]);
    return result;
  }

  async create(createAccountDto: CreateAccountDto, userId: string) {
    const account = await this.prisma.account.create({
      data: { ...createAccountDto, userId },
    });

    return this.withBalance(userId, account);
  }

  async findAll(userId: string) {
    const accounts = await this.prisma.account.findMany({ where: { userId } });

    return this.withBalances(userId, accounts);
  }

  async findOne(id: string, userId: string) {
    const result = await this.prisma.account.findFirst({
      where: { id, userId },
    });

    if (!result) {
      throw new NotFoundException('Account not found');
    }

    return this.withBalance(userId, result);
  }

  async update(id: string, updateAccountDto: UpdateAccountDto, userId: string) {
    try {
      const account = await this.prisma.account.update({
        where: { id, userId },
        data: updateAccountDto,
      });

      return await this.withBalance(userId, account);
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: string, userId: string) {
    try {
      return await this.prisma.account.delete({ where: { id, userId } });
    } catch (error) {
      this.handleError(error);
    }
  }
}
