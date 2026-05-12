import { Injectable } from '@nestjs/common';
import { PlaceService } from '../place.service';
import { UserService } from 'src/user/user.service';
import { WorkTimeService } from 'src/work-time/work-time.service';

@Injectable()
export class WorkTimePlaceUserService {
  constructor(
    private readonly placeService: PlaceService,
    private readonly userService: UserService,
    private readonly workTimeService: WorkTimeService,
  ) {}
}
