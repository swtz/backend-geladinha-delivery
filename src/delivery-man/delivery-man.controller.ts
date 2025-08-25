import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DeliveryManService } from './delivery-man.service';
import { CreateDeliveryManDto } from './dto/create-delivery-man.dto';
import { UpdateDeliveryManDto } from './dto/update-delivery-man.dto';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdatePasswordDto } from 'src/user/dto/update-password.dto';
import { ResponseDeliveryManDto } from './dto/response-delivery-man.dto';

@Controller('delivery-man')
export class DeliveryManController {
  constructor(private readonly deliveryManService: DeliveryManService) {}

  // @UseGuards(JwtAuthGuard)
  // @Get()
  // async findAll() {
  //   const deliveryMans = await this.deliveryManService.findAll();
  //   const arrayDeliveryMans = deliveryMans.map(
  //     deliveryMan => new ResponseDeliveryManDto(deliveryMan),
  //   );
  //   return arrayDeliveryMans;
  // }

  // @Post()
  // async create(@Body() dto: CreateDeliveryManDto) {
  //   const deliveryMan = await this.deliveryManService.create(dto);
  //   return new ResponseDeliveryManDto(deliveryMan);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Get('me')
  // async findOne(@Req() req: AuthenticatedRequest) {
  //   const deliveryMan = await this.deliveryManService.findOneOrFail({
  //     id: req.user.id,
  //   });
  //   return new ResponseDeliveryManDto(deliveryMan);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Patch('me')
  // async update(
  //   @Req() req: AuthenticatedRequest,
  //   @Body() dto: UpdateDeliveryManDto,
  // ) {
  //   const deliveryMan = await this.deliveryManService.update(dto, req.user.id);
  //   return new ResponseDeliveryManDto(deliveryMan);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Patch('me/password')
  // async updatePassword(
  //   @Req() req: AuthenticatedRequest,
  //   @Body() dto: UpdatePasswordDto,
  // ) {
  //   const deliveryMan = await this.deliveryManService.updatePassword(
  //     dto,
  //     req.user.id,
  //   );
  //   return new ResponseDeliveryManDto(deliveryMan);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Delete('me')
  // async remove(@Req() req: AuthenticatedRequest) {
  //   const deliveryMan = await this.deliveryManService.remove(req.user.id);
  //   return new ResponseDeliveryManDto(deliveryMan);
  // }
}
