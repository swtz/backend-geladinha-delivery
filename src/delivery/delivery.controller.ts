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
import { ResponseDeliveryDto } from './dto/response-delivery.dto';
import { PaymentMethod } from './enums/payment-methods.enum';
import { ParseBrPhonePipe } from 'src/user/pipes/format-br-phone.pipe';
import { WorkTimeDateService } from 'src/place/services/work-time-date.service';

@Roles(Role.Admin, Role.Operator)
@Controller('delivery')
export class DeliveryController {
  constructor(
    private readonly deliveryService: DeliveryService,
    private readonly workTimeDateService: WorkTimeDateService,
  ) {}

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
    @Query('type', new ParseEnumPipe(Role, { optional: true })) type: Role,
    @Query('nickname') nickname: string,
    @Query('id', new ParseUUIDPipe({ optional: true })) id: string,
    @Query('name') name: string,
    @Query('lastName') lastName: string,

    // precisa-se validar email
    @Query('email') email: string,
    @Query('phone', ParseBrPhonePipe) phone: string,
    @Query('secondPhone', ParseBrPhonePipe) secondPhone: string,
    @Query('from') fromDate: string,
    @Query('to') toDate: string,
    @Query(
      'paymentMethod',
      new ParseEnumPipe(PaymentMethod, { optional: true }),
    )
    paymentMethod: PaymentMethod,
    @Query('isPaid', new ParseBoolPipe({ optional: true })) isPaid: boolean,
  ) {
    const userData = {
      nickname,
      id,
      name,
      lastName,
      email,
      phone,
      secondPhone,
    };

    const dateObject: {
      initDate?: Date;
      endDate?: Date;
    } = { initDate: undefined, endDate: undefined };

    if (fromDate && toDate) {
      const { initDate, endDate } = await this.workTimeDateService.create(
        userData,
        fromDate,
        toDate,
      );

      dateObject.initDate = initDate;
      dateObject.endDate = endDate;
    }

    console.log('from', dateObject.initDate);
    console.log('to', dateObject.endDate);

    const deliveries = await this.deliveryService.findAll({
      type,
      userData,
      isPaid,
      paymentMethod,
      from: dateObject.initDate,
      to: dateObject.endDate,
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
