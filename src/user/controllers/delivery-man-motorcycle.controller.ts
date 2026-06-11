import {
  Body,
  Controller,
  Get,
  Param,
  ParseFloatPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { DeliveryManMotorcycleService } from '../services/delivery-man-motorcycle.service';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { CreateUserDto } from '../dtos/user/create-user.dto';
import { CreateMotorcycleDto } from '../dtos/motorcycle/create-motorcycle.dto';
import { CreateDeliveryManDto } from '../dtos/delivery-man/create-delivery-man.dto';
import { UserFieldsValidationService } from '../services/user-fields-validation.service';
import { UpdateMotorcycleDto } from '../dtos/motorcycle/update-motorcycle.dto';
import { DeliveryManService } from '../services/delivery-man.service';
import { ResponseDeliveryManDto } from '../dtos/delivery-man/response-delivery-man.dto';
import { ResponseUserDto } from '../dtos/user/response-user.dto';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';

@Roles(Role.Admin)
@Controller('motoboy')
export class DeliveryManMotorcycleController {
  constructor(
    private readonly deliveryManMotorcycleService: DeliveryManMotorcycleService,
    private readonly userFieldsValidationService: UserFieldsValidationService,
    private readonly deliveryManService: DeliveryManService,
  ) {}

  @Post()
  async create(
    @Body('user') userDto: CreateUserDto,
    @Body('motorcycle') motorcycleDto: CreateMotorcycleDto,
    @Body('deliveryMan') deliveryManDto: CreateDeliveryManDto,
  ) {
    await this.userFieldsValidationService.validateUniqueFields(userDto);
    const deliveryMan = await this.deliveryManMotorcycleService.create(
      userDto,
      deliveryManDto,
      motorcycleDto,
    );
    return new ResponseUserDto(deliveryMan);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const deliveryMan = await this.deliveryManService.findOneByOrFail(
      { user: { id } },
      true,
    );
    return new ResponseDeliveryManDto(deliveryMan);
  }

  @Roles(Role.Motoboy)
  @Patch('me')
  async updateMe(
    @Body('motorcycle') motorcycleDto: UpdateMotorcycleDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const deliveryMan = await this.deliveryManMotorcycleService.update(
      req.user.id,
      motorcycleDto,
    );
    return new ResponseDeliveryManDto(deliveryMan);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('motorcycle') motorcycleDto: UpdateMotorcycleDto,
    @Body('daily', new ParseFloatPipe({ optional: true })) daily: number,
  ) {
    const deliveryMan = await this.deliveryManMotorcycleService.update(
      id,
      motorcycleDto,
      daily,
    );
    return new ResponseDeliveryManDto(deliveryMan);
  }

  @Patch('restrict/:id')
  async updateRestrictMotorcycle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('motorcycle') motorcycleDto: UpdateMotorcycleDto,
  ) {
    const deliveryMan = await this.deliveryManMotorcycleService.update(
      id,
      motorcycleDto,
    );
    return new ResponseDeliveryManDto(deliveryMan);
  }
}
