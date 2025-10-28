import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { PlaceService } from './place.service';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';
import { CreatePlaceDto } from './dto/create-place.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { UpdateAddressDto } from 'src/address/dto/update-address.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { CreateWorkTimeDto } from 'src/work-time/dto/create-work-time.dto';
import { UpdateDefaultWorkTimeDto } from 'src/work-time/dto/update-default-work-time.dto';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';

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
    return place;
  }

  @Patch('me/:id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdatePlaceDto,
    @Body('address') address: UpdateAddressDto,
    @Body('postalBox') postalBox: UpdateAddressDto,
    @Body('workTime') workTime: UpdateDefaultWorkTimeDto,
  ) {
    const place = await this.placeService.update(id, {
      ...dto,
      address,
      postalBox,
      workTime,
    });
    return place;
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const place = await this.placeService.findOneByOrFail({ id });
    return place;
  }

  @Post(':id/work-time')
  async addWorkTime(
    @Body() dto: CreateWorkTimeDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const place = await this.placeService.addWorkTime(dto, id);
    return place;
  }
}
