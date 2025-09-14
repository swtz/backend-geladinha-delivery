import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { ParseBrDatePipe } from 'src/delivery/pipes/parse-br-date.pipe';
import { END_TIME, START_TIME } from 'src/common/operation-time';
import { ResponseDeliveryDto } from 'src/delivery/dto/response-delivery.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('payout')
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async preview(
    @Query('fromDate', new ParseBrDatePipe(START_TIME)) fromDate: Date,
    @Query('toDate', new ParseBrDatePipe(END_TIME)) toDate: Date,
    @Query('motoboy') motoboy: string,
  ) {
    const deliveries = await this.payoutService.preview(
      fromDate,
      toDate,
      motoboy,
    );
    const parsedDeliveries = deliveries.map(
      delivery => new ResponseDeliveryDto(delivery),
    );

    return parsedDeliveries;
  }
}
