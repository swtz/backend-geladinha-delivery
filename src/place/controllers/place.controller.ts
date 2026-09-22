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
  UnauthorizedException,
} from '@nestjs/common';
import { PlaceService } from '../services/place.service';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';
import { CreatePlaceDto } from '../dto/create-place.dto';
import { UpdatePlaceDto } from '../dto/update-place.dto';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { Shift } from 'src/common/enums/work-shifts.enum';
import { ParseBrPhonePipe } from 'src/user/pipes/format-br-phone.pipe';
import { ResponsePlaceDto } from '../dto/response-place.dto';
import { ParseCpfPipe } from '../pipes/parse-cpf.pipe';
import { ParseCnpjPipe } from '../pipes/parse-cnpj.pipe';
import { PlaceFieldsValidationService } from '../services/place-fields-validation.service';
import {
  CommonType,
  ParseOrderParamsPipe,
} from 'src/delivery/pipes/parse-order-params.pipe';
import { Place } from '../entities/place.entity';
import { FindOptionsOrder, FindOptionsOrderValue } from 'typeorm';
import { ParseEmailPipe } from 'src/user/pipes/format-email.pipe';
import { placeOrderMap } from 'src/common/data/entity-instructions/ordering';
import { UserService } from 'src/user/services/user.service';

@Roles(Role.Admin)
@Controller('place')
export class PlaceController {
  constructor(
    private readonly placeService: PlaceService,
    private readonly userService: UserService,
    private readonly placeFieldsValidationService: PlaceFieldsValidationService,
  ) {}

  @Post('me')
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreatePlaceDto,
    @Body('cpf', ParseCpfPipe) cpf: string,
    @Body('cnpj', ParseCnpjPipe) cnpj: string,
    @Body('phone', ParseBrPhonePipe) phone: string,
    @Body('secondPhone', ParseBrPhonePipe) secondPhone: string,
  ) {
    const safeDto = {
      ...dto,
      cpf,
      cnpj,
      phone,
      secondPhone,
    };
    await this.placeFieldsValidationService.validateUniqueFields(safeDto);
    const place = await this.placeService.create(safeDto, req.user);
    return new ResponsePlaceDto(place);
  }

  @Patch('me/:id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlaceDto,
    @Body('cpf', ParseCpfPipe) cpf: string,
    @Body('cnpj', ParseCnpjPipe) cnpj: string,
    @Body('phone', ParseBrPhonePipe) phone: string,
    @Body('secondPhone', ParseBrPhonePipe) secondPhone: string,
  ) {
    const place = await this.placeService.findOneByOrFail({ id });
    const isOwner = place.owners.some(owner => owner.id === req.user.id);
    if (!isOwner) {
      throw new UnauthorizedException('Acesso negado');
    }
    const safeDto = {
      ...dto,
      cpf,
      cnpj,
      phone,
      secondPhone,
    };
    await this.placeFieldsValidationService.validateUniqueFields(safeDto);
    const updated = await this.placeService.update(place, safeDto);
    return new ResponsePlaceDto(updated);
  }

  @Patch('me/:id/:code')
  async updateCode(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('code') code: string,
  ) {
    const place = await this.placeService.findOneByOrFail({ id });
    const isOwner = place.owners.some(owner => owner.id === req.user.id);
    if (!isOwner) {
      throw new UnauthorizedException('Acesso negado');
    }

    const updated = await this.placeService.updateCode(place, code);
    return new ResponsePlaceDto(updated);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const place = await this.placeService.findOneByOrFail({ id });
    return new ResponsePlaceDto(place);
  }

  @Roles(Role.Admin, Role.Operator)
  @Get()
  async findAll(
    @Query('type') type: 'workTime' | 'owner',
    @Query('nickname') nickname: string,
    @Query('id', new ParseUUIDPipe({ optional: true })) id: string,
    @Query('name') name: string,
    @Query('lastName') lastName: string,
    @Query('email', ParseEmailPipe) email: string,
    @Query('phone', ParseBrPhonePipe) phone: string,
    @Query('secondPhone', ParseBrPhonePipe) secondPhone: string,
    @Query('shift', new ParseEnumPipe(Shift, { optional: true })) shift: Shift,
    @Query('isDefault', new ParseBoolPipe({ optional: true }))
    isDefault: boolean,
    @Query('isShared', new ParseBoolPipe({ optional: true }))
    isShared: boolean,
    @Query(new ParseOrderParamsPipe<CommonType<Place>>(placeOrderMap))
    orderParams: {
      [K in keyof FindOptionsOrder<Place>]: FindOptionsOrderValue;
    },
  ) {
    const userData = {
      id,
      nickname,
      name,
      lastName,
      phone,
      secondPhone,
      email,
    };
    const workTimeData = { shift, isDefault, isShared };
    const places = await this.placeService.findAll(
      {
        owners: type === 'owner' ? userData : undefined,
        workTimes:
          type === 'workTime'
            ? { ...workTimeData, users: [userData] }
            : workTimeData,
      },
      orderParams,
    );
    const parsedPlaces = places.map(item => new ResponsePlaceDto(item));
    return parsedPlaces;
  }

  @Delete('me/:id')
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const place = await this.placeService.remove(id, req.user);
    return new ResponsePlaceDto(place);
  }
}
