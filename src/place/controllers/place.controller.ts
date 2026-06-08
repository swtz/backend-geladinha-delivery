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
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { UpdateAddressDto } from 'src/address/dto/update-address.dto';
import { UpdatePlaceDto } from '../dto/update-place.dto';
import { CreateWorkTimeDto } from 'src/work-time/dto/work-time/create-work-time.dto';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { Shift } from 'src/common/enums/work-shifts.enum';
import { ParseBrPhonePipe } from 'src/user/pipes/format-br-phone.pipe';
import { ResponsePlaceDto } from '../dto/response-place.dto';

@Roles(Role.Admin)
@Controller('place')
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  @Post('me')
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreatePlaceDto,
    @Body('address') address: CreateAddressDto,
    @Body('postalBox') postalBox: CreateAddressDto,
    @Body('workTime') workTime: CreateWorkTimeDto,
  ) {
    const place = await this.placeService.create(
      { ...dto, address, postalBox, workTime },
      req.user,
    );
    return new ResponsePlaceDto(place);
  }

  @Patch('me/:id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlaceDto,
    @Body('address') address: UpdateAddressDto,
    @Body('postalBox') postalBox: UpdateAddressDto,
  ) {
    const place = await this.placeService.update(id, {
      ...dto,
      address,
      postalBox,
    });
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
