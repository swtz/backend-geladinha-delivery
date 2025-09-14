import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { ParseBrDatePipe } from './pipes/parse-br-date.pipe';
import { END_TIME, START_TIME } from 'src/common/operation-time';
import { ResponseDeliveryDto } from './dto/response-delivery.dto';

@Roles(Role.Admin, Role.Operator)
@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @UseGuards(JwtAuthGuard)
  @Post('me')
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateDeliveryDto,
  ) {
    const delivery = await this.deliveryService.create(dto, req.user);
    return new ResponseDeliveryDto(delivery);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/:id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateDeliveryDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const delivery = await this.deliveryService.update(dto, req.user, id);
    return new ResponseDeliveryDto(delivery);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/:id')
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const delivery = await this.deliveryService.remove(req.user, id);
    return new ResponseDeliveryDto(delivery);
  }

  @Roles(Role.Operator, Role.Motoboy, Role.Admin)
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query('paid', new ParseBoolPipe({ optional: true })) paid: boolean,
    @Query('customer') customer: string,
    @Query('motoboy') motoboy: string,
    @Query('operator') operator: string,
    @Query('fromDate', new ParseBrDatePipe(START_TIME)) fromDate: Date,
    @Query('toDate', new ParseBrDatePipe(END_TIME)) toDate: Date,
    // paymentMethod (?)
  ) {
    const deliveries = await this.deliveryService.findAll({
      customer,
      motoboy,
      operator,
      paid,
      fromDate,
      toDate,
    });
    const parsedDeliveries = deliveries.map(
      delivery => new ResponseDeliveryDto(delivery),
    );
    return parsedDeliveries;
  }

  @Roles(Role.Admin, Role.Operator, Role.Motoboy)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findAllOwned(@Req() req: AuthenticatedRequest) {
    const deliveries = await this.deliveryService.findAllOwned(req.user);
    const parsedDeliveries = deliveries.map(
      delivery => new ResponseDeliveryDto(delivery),
    );
    return parsedDeliveries;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOneBy(@Param('id', ParseUUIDPipe) id: string) {
    const delivery = await this.deliveryService.findOneByOrFail({ id });
    return new ResponseDeliveryDto(delivery);
  }
}
