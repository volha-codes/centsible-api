import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { OverviewQuery } from './dto/overview.query';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  overview(@Query() query: OverviewQuery, @CurrentUser() userId: string) {
    return this.statsService.overview(userId, query);
  }
}
