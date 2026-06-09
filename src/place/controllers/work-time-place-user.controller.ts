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
import { ResponseWorkTimeDto } from 'src/work-time/dto/work-time/response-work-time.dto';
import { UpdateWorkTimeDto } from 'src/work-time/dto/work-time/update-work-time.dto';
import { WorkTimeDateService } from '../services/work-time-date.service';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { CreateWorkTimeDto } from 'src/work-time/dto/work-time/create-work-time.dto';

@Roles(Role.Admin)
@Controller('work-time-place')
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

  @Get(':id')
  async findAllOfPlace(
    @Param('id', new ParseUUIDPipe({ optional: true })) id: string,
  ) {
    const qo = id ? { id } : { code: process.env.DEFAULT_PLACE_CODE };
    const { workTimes } = await this.placeService.findOneByOrFail(qo);
    const parsedWorkTimes = workTimes.map(
      item => new ResponseWorkTimeDto(item),
    );
    return parsedWorkTimes;
  }

  @Post(':id')
  async addToPlace(
    @Param('id') id: string,
    @Body() dto: CreateWorkTimeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const place = await this.workTimePlaceUserService.addToPlace(
      id,
      dto,
      req.user,
    );
    return new ResponsePlaceDto(place);
  }

  @Patch('me/:id')
  async updateShared(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWorkTimeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const workTime = await this.workTimePlaceUserService.updateShared(
      id,
      dto,
      req.user,
    );
    return new ResponseWorkTimeDto(workTime);
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
}
