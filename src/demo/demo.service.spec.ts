import type { PrismaService } from 'src/prisma/prisma.service';
import { DEMO_EMAIL, DemoService } from './demo.service';

type Where = { where: { userId: string } };
type NamedRows = { data: { name: string }[] };
type TransactionRows = { data: { userId: string }[] };

const makeMocks = () => {
  const named = (prefix: string) =>
    jest.fn(({ data }: NamedRows) =>
      Promise.resolve(
        data.map((row, i) => ({ id: `${prefix}${i}`, name: row.name })),
      ),
    );

  const tx = {
    transaction: {
      deleteMany: jest.fn<Promise<void>, [Where]>(),
      createMany: jest.fn<Promise<void>, [TransactionRows]>(),
    },
    account: {
      deleteMany: jest.fn<Promise<void>, [Where]>(),
      createManyAndReturn: named('a'),
    },
    category: {
      deleteMany: jest.fn<Promise<void>, [Where]>(),
      createManyAndReturn: named('c'),
    },
  };

  const prisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'demo-id',
        email: DEMO_EMAIL,
        firstName: 'Demo',
      }),
    },
    $transaction: jest.fn((fn: (t: typeof tx) => Promise<void>) => fn(tx)),
  };

  return {
    prisma,
    tx,
    createService: () => new DemoService(prisma as unknown as PrismaService),
  };
};

describe('DemoService', () => {
  it('wipes the demo user data before seeding it again', async () => {
    const { tx, createService } = makeMocks();

    const user = await createService().reset();

    expect(user.id).toBe('demo-id');
    const wipe = { where: { userId: 'demo-id' } };
    expect(tx.transaction.deleteMany).toHaveBeenCalledWith(wipe);
    expect(tx.account.deleteMany).toHaveBeenCalledWith(wipe);
    expect(tx.category.deleteMany).toHaveBeenCalledWith(wipe);

    const created = tx.transaction.createMany.mock.calls[0][0].data;
    expect(created.length).toBeGreaterThan(30);
    expect(created.every((t) => t.userId === 'demo-id')).toBe(true);
  });

  it('does not reseed again during the cooldown', async () => {
    const { prisma, createService } = makeMocks();
    const service = createService();

    await service.reset();
    await service.reset();

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('seeds only once for simultaneous requests', async () => {
    const { prisma, createService } = makeMocks();
    const service = createService();

    await Promise.all([service.reset(), service.reset(), service.reset()]);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('seeds again after a failed attempt', async () => {
    const { prisma, createService } = makeMocks();
    prisma.$transaction.mockRejectedValueOnce(new Error('database is asleep'));
    const service = createService();

    await expect(service.reset()).rejects.toThrow('database is asleep');
    await service.reset();

    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
  });
});
