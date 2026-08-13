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
import { formatPhone } from 'src/common/utils/format-phone';
import { ParsePlaceCodePipe } from 'src/place/pipes/parse-place-code.pipe';
import { ResponseMotorcycleDto } from '../dtos/motorcycle/response-motorcycle.dto';

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
    @Body('user', ParsePlaceCodePipe)
    userDto: CreateUserDto,
    @Body('motorcycle', ParsePlaceCodePipe)
    motorcycleDto: CreateMotorcycleDto,
    @Body('deliveryMan') deliveryManDto: CreateDeliveryManDto,
  ) {
    const parsedUserDto: CreateUserDto = {
      ...userDto,
      phone: formatPhone(userDto.phone),
      secondPhone: userDto.secondPhone
        ? formatPhone(userDto.secondPhone)
        : undefined,
    };
    await this.userFieldsValidationService.validateUniqueFields(parsedUserDto);
    const deliveryMan = await this.deliveryManMotorcycleService.create(
      parsedUserDto,
      deliveryManDto,
      motorcycleDto,
    );
    return new ResponseUserDto(deliveryMan);
  }

  @Post(':id')
  async createUsingMotorcycleId(
    @Param('id', ParseUUIDPipe) motorcycleId: string,
    @Body('user', ParsePlaceCodePipe)
    userDto: CreateUserDto,
    @Body('deliveryMan') deliveryManDto: CreateDeliveryManDto,
  ) {
    const parsedUserDto: CreateUserDto = {
      ...userDto,
      phone: formatPhone(userDto.phone),
      secondPhone: userDto.secondPhone
        ? formatPhone(userDto.secondPhone)
        : undefined,
    };
    await this.userFieldsValidationService.validateUniqueFields(parsedUserDto);
    const deliveryMan = await this.deliveryManMotorcycleService.create(
      parsedUserDto,
      deliveryManDto,
      motorcycleId,
    );
    return new ResponseUserDto(deliveryMan);
  }

  @Roles(Role.Admin, Role.Operator)
  @Get()
  async findAll() {
    const deliveryMen = await this.deliveryManService.findAllMotoboy();
    const parsedDeliveryMen = deliveryMen.map(
      item => new ResponseDeliveryManDto(item),
    );
    return parsedDeliveryMen;
  }

  @Roles(Role.Admin, Role.Operator)
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const deliveryMan = await this.deliveryManService.findOneByOrFail(
      { user: { id } },
      true,
    );
    return new ResponseDeliveryManDto(deliveryMan);
  }

  @Roles(Role.Motoboy)
  @Patch('me/motorcycle')
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

  @Patch('motorcycle/restrict/:id')
  async updateRestrictMotorcycle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('motorcycle', ParsePlaceCodePipe)
    motorcycleDto: UpdateMotorcycleDto,
  ) {
    const motorcycle =
      await this.deliveryManMotorcycleService.updateRestrictMotorcycle(
        id,
        motorcycleDto,
      );
    return new ResponseMotorcycleDto(motorcycle);
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
}
