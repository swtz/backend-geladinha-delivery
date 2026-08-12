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

@Roles(Role.Admin)
@Controller('place')
export class PlaceController {
  constructor(
    private readonly placeService: PlaceService,
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
    const safeDto = {
      ...dto,
      cpf,
      cnpj,
      phone,
      secondPhone,
    };
    await this.placeFieldsValidationService.validateUniqueFields(safeDto);
    const place = await this.placeService.update(id, safeDto, req.user);
    return new ResponsePlaceDto(place);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const place = await this.placeService.findOneByOrFail({ id });
    return new ResponsePlaceDto(place);
  }

  @Get()
  async findAll(
    @Query('name') ownName: string,
    @Query('phone', ParseBrPhonePipe) ownPhone: string,
    @Query('id', new ParseUUIDPipe({ optional: true })) ownId: string,
    @Query('shift', new ParseEnumPipe(Shift, { optional: true })) shift: Shift,
    @Query('isDefault', new ParseBoolPipe({ optional: true }))
    isDefault: boolean,
  ) {
    const places = await this.placeService.findAll({
      ownName,
      ownId,
      ownPhone,
      shift,
      isDefault,
    });
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
