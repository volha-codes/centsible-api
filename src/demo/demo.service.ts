import { Injectable } from '@nestjs/common';
import { hash } from '@node-rs/argon2';
import { Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildDemoData } from './demo-data';

export const DEMO_EMAIL = 'demo@centsible.app';
export const RESET_COOLDOWN_MS = 30_000;

const USER_SELECT = { id: true, email: true, firstName: true } as const;

function pick(map: Map<string, string>, key: string): string {
  const value = map.get(key);

  if (!value) {
    throw new Error(`Demo data refers to an unknown name: ${key}`);
  }

  return value;
}

@Injectable()
export class DemoService {
  private lastReset = 0;
  private inFlight: Promise<void> | null = null;

  constructor(private readonly prisma: PrismaService) {}

  private async ensureUser() {
    const existing = await this.prisma.user.findUnique({
      where: { email: DEMO_EMAIL },
      select: USER_SELECT,
    });

    if (existing) return existing;

    try {
      return await this.prisma.user.create({
        data: {
          email: DEMO_EMAIL,
          firstName: 'Demo',
          hashedPassword: await hash(randomBytes(32).toString('hex')),
        },
        select: USER_SELECT,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return this.prisma.user.findUniqueOrThrow({
          where: { email: DEMO_EMAIL },
          select: USER_SELECT,
        });
      }

      throw error;
    }
  }

  private async seed(userId: string) {
    const data = buildDemoData(new Date());

    await this.prisma.$transaction(
      async (tx) => {
        await tx.transaction.deleteMany({ where: { userId } });
        await tx.account.deleteMany({ where: { userId } });
        await tx.category.deleteMany({ where: { userId } });

        const categories = await tx.category.createManyAndReturn({
          data: data.categories.map((c) => ({ ...c, userId })),
        });
        const accounts = await tx.account.createManyAndReturn({
          data: data.accounts.map((a) => ({ ...a, userId })),
        });

        const categoryIds = new Map(categories.map((c) => [c.name, c.id]));
        const accountIds = new Map(accounts.map((a) => [a.name, a.id]));

        await tx.transaction.createMany({
          data: data.transactions.map((t) => ({
            userId,
            accountId: pick(accountIds, t.account),
            categoryId: pick(categoryIds, t.category),
            amount: t.amount,
            date: t.date,
            note: t.note,
          })),
        });
      },
      { timeout: 20_000 },
    );
  }

  async reset() {
    const user = await this.ensureUser();

    if (this.inFlight) {
      await this.inFlight;
      return user;
    }

    if (Date.now() - this.lastReset < RESET_COOLDOWN_MS) {
      return user;
    }

    this.inFlight = this.seed(user.id)
      .then(() => {
        this.lastReset = Date.now();
      })
      .finally(() => {
        this.inFlight = null;
      });

    await this.inFlight;
    return user;
  }
}
