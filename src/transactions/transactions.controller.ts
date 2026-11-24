import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { FindTransactionsQuery } from './dto/find-transactions.query';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() dto: CreateTransactionDto, @CurrentUser() userId: string) {
    return this.transactionsService.create(dto, userId);
  }

  @Get()
  findAll(
    @Query() query: FindTransactionsQuery,
    @CurrentUser() userId: string,
  ) {
    return this.transactionsService.findAll(userId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.transactionsService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
    @CurrentUser() userId: string,
  ) {
    return this.transactionsService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.transactionsService.remove(id, userId);
  }
}
