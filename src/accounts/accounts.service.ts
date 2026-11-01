import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

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

  create(createAccountDto: CreateAccountDto, userId: string) {
    return this.prisma.account.create({
      data: { ...createAccountDto, userId },
    });
  }

  findAll(userId: string) {
    return this.prisma.account.findMany({ where: { userId } });
  }

  async findOne(id: string, userId: string) {
    const result = await this.prisma.account.findFirst({
      where: { id, userId },
    });

    if (!result) {
      throw new NotFoundException('Account not found');
    }

    return result;
  }

  async update(id: string, updateAccountDto: UpdateAccountDto, userId: string) {
    try {
      return await this.prisma.account.update({
        where: { id, userId },
        data: updateAccountDto,
      });
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
