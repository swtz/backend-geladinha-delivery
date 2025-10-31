import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { PlaceService } from './place.service';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';
import { CreatePlaceDto } from './dto/create-place.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { UpdateAddressDto } from 'src/address/dto/update-address.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { CreateWorkTimeDto } from 'src/work-time/dto/create-work-time.dto';
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
    @Body() dto: UpdatePlaceDto,
    @Body('address') address: UpdateAddressDto,
    @Body('postalBox') postalBox: UpdateAddressDto,
  ) {
    const place = await this.placeService.update(id, {
      ...dto,
      address,
      postalBox,
    });
    return place;
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const place = await this.placeService.findOneByOrFail({ id });
    return place;
  }

  @Post('work-time')
  async addWorkTime(
    @Body() dto: CreateWorkTimeDto,
    @Query('placeId', ParseUUIDPipe) placeId: string,
  ) {
    const workTime = await this.placeService.addWorkTime(dto, placeId);
    return workTime;
  }
}
