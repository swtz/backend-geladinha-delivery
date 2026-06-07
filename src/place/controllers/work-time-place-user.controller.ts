import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { WorkTimePlaceUserService } from '../services/work-time-place-user.service';
import { PlaceService } from '../services/place.service';
import { ResponsePlaceDto } from '../dto/response-place.dto';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';
import { ResponseWorkTimeDto } from 'src/work-time/dto/response-work-time.dto';
import { UpdateWorkTimeDto } from 'src/work-time/dto/update-work-time.dto';
import { WorkTimeDateService } from '../services/work-time-date.service';

@Controller('work-time-place-user')
export class WorkTimePlaceUserController {
  constructor(
    private readonly workTimePlaceUserService: WorkTimePlaceUserService,
    private readonly placeService: PlaceService,
    private readonly workTimeDateService: WorkTimeDateService,
  ) {}

  @Get('date')
  async getDateObject(
    @Req() req: AuthenticatedRequest,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const date = await this.workTimeDateService.create(
      { id: req.user.id },
      from,
      to,
    );
    return date;
  }

  @Post('place')
  async addWorkTimeToPlace(
    @Body('workTimeId') workTimeId: string,
    @Body('placeId') placeId: string,
  ) {
    if (!workTimeId || !placeId) {
      throw new BadRequestException('Preencha todos os campos');
    }

    const workTime = await this.workTimePlaceUserService.addWorkTimeToPlace(
      workTimeId,
      placeId,
    );

    return workTime;
  }

  @Post('user')
  async updateUserWorkTime(
    @Body('workTimeId') workTimeId: string,
    @Body('userId') userId: string,
  ) {
    if (!workTimeId || !userId) {
      throw new BadRequestException('Preencha todos os campos');
    }

    const workTime = await this.workTimePlaceUserService.updateUserWorkTime(
      workTimeId,
      userId,
    );

    return workTime;
  }

  // @Post('work-time')
  // async addWorkTime(
  //   @Body() dto: CreateWorkTimeDto,
  //   @Query('placeId', ParseUUIDPipe) placeId: string,
  // ) {
  //   const place = await this.placeService.addWorkTime(dto, placeId);
  //   return new ResponsePlaceDto(place);
  // }

  @Patch('me/:id/work-time')
  async updateSharedWorkTime(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWorkTimeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const place = await this.placeService.updateSharedWorkTime(
      dto,
      id,
      req.user,
    );
    return new ResponsePlaceDto(place);
  }

  @Get('place')
  async findAllOfPlace(
    @Query('id', new ParseUUIDPipe({ optional: true })) id: string,
  ) {
    const qo = id ? { id } : { code: process.env.DEFAULT_PLACE_CODE };
    const { workTimes } = await this.placeService.findOneByOrFail(qo);
    const parsedWorkTimes = workTimes.map(
      item => new ResponseWorkTimeDto(item),
    );
    return parsedWorkTimes;
  }

  @Delete('me/work-time/:id')
  async removeWorkTime(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('placeId', ParseUUIDPipe) placeId: string,
  ) {
    const place = await this.placeService.removeWorkTime(placeId, id, req.user);
    return new ResponsePlaceDto(place);
  }
}
