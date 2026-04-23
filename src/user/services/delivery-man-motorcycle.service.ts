import { Injectable } from '@nestjs/common';
import { UserService } from '../user.service';
import { MotorcycleService } from './motorcycle.service';

@Injectable()
export class DeliveryManMotorcycleService {
  constructor(
    private readonly userService: UserService,
    private readonly motorcycleService: MotorcycleService,
  ) {}
}
