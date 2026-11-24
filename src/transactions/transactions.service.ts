import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { FindTransactionsQuery } from './dto/find-transactions.query';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  private handleError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Transaction not found');
    }

    throw error;
  }

  private async assertOwned(
    userId: string,
    ids: { accountId?: string; categoryId?: string },
  ) {
    if (ids.accountId) {
      const account = await this.prisma.account.findFirst({
        where: { id: ids.accountId, userId },
        select: { id: true },
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }
    }

    if (ids.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { id: ids.categoryId, userId },
        select: { id: true },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }
  }

  async create(dto: CreateTransactionDto, userId: string) {
    await this.assertOwned(userId, dto);

    return this.prisma.transaction.create({
      data: {
        accountId: dto.accountId,
        categoryId: dto.categoryId,
        amount: dto.amount,
        date: new Date(dto.date),
        note: dto.note ?? '',
        userId,
      },
    });
  }

  findAll(userId: string, query: FindTransactionsQuery) {
    return this.prisma.transaction.findMany({
      where: {
        userId,
        accountId: query.accountId,
        categoryId: query.categoryId,
        date: {
          gte: query.from ? new Date(query.from) : undefined,
          lt: query.to ? new Date(query.to) : undefined,
        },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string, userId: string) {
    const result = await this.prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!result) {
      throw new NotFoundException('Transaction not found');
    }

    return result;
  }

  async update(id: string, dto: UpdateTransactionDto, userId: string) {
    await this.assertOwned(userId, dto);

    const { date, ...rest } = dto;

    try {
      return await this.prisma.transaction.update({
        where: { id, userId },
        data: { ...rest, date: date ? new Date(date) : undefined },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: string, userId: string) {
    try {
      return await this.prisma.transaction.delete({ where: { id, userId } });
    } catch (error) {
      this.handleError(error);
    }
  }
}
