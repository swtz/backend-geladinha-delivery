import { Controller } from '@nestjs/common';
import { WorkTimePlaceUserService } from '../services/work-time-place-user.service';
import { PlaceService } from '../place.service';

@Controller('work-time-place-user')
export class WorkTimePlaceUserController {
  constructor(
    private readonly workTimePlaceUserService: WorkTimePlaceUserService,
    private readonly placeService: PlaceService,
  ) {}
}
