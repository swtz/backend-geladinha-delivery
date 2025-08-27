import { Controller } from '@nestjs/common';
import { DeliveryService } from './delivery.service';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  // @UseGuards(JwtAuthGuard)
  // @Post('me')
  // async create(
  //   @Req() req: AuthenticatedRequest,
  //   @Body() dto: CreateDeliveryDto,
  // ) {
  //   const delivery = await this.deliveryService.create(dto, req.user);

  //   return new ResponseDeliveryDto(delivery);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Patch('me/:id')
  // async update(
  //   @Req() req: AuthenticatedRequest,
  //   @Body() dto: UpdateDeliveryDto,
  //   @Param('id', ParseUUIDPipe) id: string,
  // ) {
  //   const delivery = await this.deliveryService.update(dto, req.user, { id });

  //   return new ResponseDeliveryDto(delivery);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Delete('me/:id')
  // async remove(
  //   @Req() req: AuthenticatedRequest,
  //   @Param('id', ParseUUIDPipe) id: string,
  // ) {
  //   const delivery = await this.deliveryService.remove(req.user, { id });

  //   return new ResponseDeliveryDto(delivery);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Get('me/:id')
  // async findOneOwnedBy(
  //   @Req() req: AuthenticatedRequest,
  //   @Param('id', ParseUUIDPipe) id: string,
  // ) {
  //   const ownedDelivery = await this.deliveryService.findOneOwnedByOrFail(
  //     { id },
  //     req.user,
  //   );

  //   return new ResponseDeliveryDto(ownedDelivery);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Get('me')
  // async findAllOwnedBy(@Req() req: AuthenticatedRequest) {
  //   const ownedDeliveries = await this.deliveryService.findAllOwnedBy(req.user);

  //   const arrayDeliveries = ownedDeliveries.map(
  //     delivery => new ResponseDeliveryDto(delivery),
  //   );

  //   return arrayDeliveries;
  // }

  // @UseGuards(JwtAuthGuard)
  // @Get()
  // async findAll() {
  //   const deliveries = await this.deliveryService.findAll();

  //   const arrayDeliveries = deliveries.map(
  //     delivery => new ResponseDeliveryDto(delivery),
  //   );

  //   return arrayDeliveries;
  // }

  // @UseGuards(JwtAuthGuard)
  // @Get(':bool')
  // async findAllPaid(@Param('bool', ParseBoolPipe) bool: boolean) {
  //   const deliveries = await this.deliveryService.findAllPaid(bool);

  //   const arrayDeliveries = deliveries.map(
  //     delivery => new ResponseDeliveryDto(delivery),
  //   );

  //   return arrayDeliveries;
  // }
}
