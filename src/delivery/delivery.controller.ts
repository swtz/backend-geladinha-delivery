import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { ParseBrDatePipe } from './pipes/parse-br-date.pipe';
import { END_TIME, START_TIME } from 'src/common/operation-time';
import { ResponseDeliveryDto } from './dto/response-delivery.dto';
import { PaymentMethod } from './enums/payment-methods.enum';
import { ParseBrPhonePipe } from 'src/user/pipes/format-br-phone.pipe';

@Roles(Role.Admin, Role.Operator)
@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post('me')
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateDeliveryDto,
  ) {
    const delivery = await this.deliveryService.create(dto, req.user);
    return new ResponseDeliveryDto(delivery);
  }

  @Patch('me/:id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateDeliveryDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const delivery = await this.deliveryService.update(dto, req.user, id);
    return new ResponseDeliveryDto(delivery);
  }

  @Delete('me/:id')
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const delivery = await this.deliveryService.remove(req.user, id);
    return new ResponseDeliveryDto(delivery);
  }

  @Roles(Role.Operator, Role.Motoboy, Role.Admin)
  @Get()
  async findAll(
    @Query('isPaid', new ParseBoolPipe({ optional: true })) isPaid: boolean,
    @Query('cstName') cstName: string,
    @Query('mtbName') mtbName: string,
    @Query('optName') optName: string,
    @Query('cstPhone', ParseBrPhonePipe) cstPhone: string,
    @Query('mtbPhone', ParseBrPhonePipe) mtbPhone: string,
    @Query('optPhone', ParseBrPhonePipe) optPhone: string,
    @Query('from', new ParseBrDatePipe(START_TIME)) from: Date,
    @Query('to', new ParseBrDatePipe(END_TIME)) to: Date,
    @Query(
      'paymentMethod',
      new ParseEnumPipe(PaymentMethod, { optional: true }),
    )
    paymentMethod: PaymentMethod,
  ) {
    const deliveries = await this.deliveryService.findAll({
      cstName,
      mtbName,
      optName,
      cstPhone,
      mtbPhone,
      optPhone,
      isPaid,
      paymentMethod,
      from,
      to,
    });
    const parsedDeliveries = deliveries.map(
      delivery => new ResponseDeliveryDto(delivery),
    );
    return parsedDeliveries;
  }

  @Roles(Role.Admin, Role.Operator, Role.Motoboy)
  @Get('me')
  async findAllOwned(@Req() req: AuthenticatedRequest) {
    const deliveries = await this.deliveryService.findAllOwned(req.user);
    const parsedDeliveries = deliveries.map(
      delivery => new ResponseDeliveryDto(delivery),
    );
    return parsedDeliveries;
  }

  @Get(':id')
  async findOneBy(@Param('id', ParseUUIDPipe) id: string) {
    const delivery = await this.deliveryService.findOneByOrFail({ id });
    return new ResponseDeliveryDto(delivery);
  }
}
