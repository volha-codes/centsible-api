import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto, userId: string) {
    try {
      return await this.prisma.category.create({
        data: { ...createCategoryDto, userId },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Category with this name already exists');
      }
      throw error;
    }
  }

  findAll(userId: string) {
    return this.prisma.category.findMany({ where: { userId } });
  }

  async findOne(id: string, userId: string) {
    const result = await this.prisma.category.findUnique({
      where: { id, userId },
    });

    if (!result) {
      throw new NotFoundException('Category not found');
    }

    return result;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    userId: string,
  ) {
    try {
      return await this.prisma.category.update({
        where: { id, userId },
        data: updateCategoryDto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Category with this name already exists');
      } else if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Category not found');
      }

      throw error;
    }
  }

  async remove(id: string, userId: string) {
    try {
      return await this.prisma.category.delete({ where: { id, userId } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Category not found');
      }

      throw error;
    }
  }
}
