import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { SettlementService } from './settlement.service';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ParseBrDatePipe } from 'src/delivery/pipes/parse-br-date.pipe';
import { END_TIME, START_TIME } from 'src/common/operation-time';
import { ResponseSettlementDto } from './dto/response-settlement.dto';

@Roles(Role.Admin, Role.Operator)
@Controller('settlement')
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @UseGuards(JwtAuthGuard)
  @Get('preview')
  async preview(
    @Query('fromDate', new ParseBrDatePipe(START_TIME)) fromDate: Date,
    @Query('toDate', new ParseBrDatePipe(END_TIME)) toDate: Date,
    @Query('operatorName') operatorName: string,
  ) {
    const settlement = await this.settlementService.preview(
      { name: operatorName },
      fromDate,
      toDate,
    );
    return new ResponseSettlementDto(settlement);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body('fromDate', new ParseBrDatePipe(START_TIME)) fromDate: Date,
    @Body('toDate', new ParseBrDatePipe(END_TIME)) toDate: Date,
    @Body('operatorName') operatorName: string,
  ) {
    const preview = await this.settlementService.preview(
      { name: operatorName },
      fromDate,
      toDate,
    );
    const settlement = await this.settlementService.create(preview);
    return new ResponseSettlementDto(settlement);
  }
}
