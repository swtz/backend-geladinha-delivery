import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
} from '@nestjs/common';
import { PlaceService } from './place.service';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';
import { CreatePlaceDto } from './dto/place/create-place.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { CreateWorkTimeDto } from './dto/work-time/create-work-time.dto';

@Controller('place')
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  @Post('me')
  async created(
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
