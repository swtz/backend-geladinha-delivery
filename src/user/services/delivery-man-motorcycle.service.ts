import { Injectable } from '@nestjs/common';
import { UserService } from '../user.service';
import { MotorcycleService } from './motorcycle.service';
import { CreateUserDto } from '../dtos/user/create-user.dto';
import { generateBadRequestException } from 'src/common/generate-exception';
import { CreateMotorcycleDto } from '../dtos/motorcycle/create-motorcycle.dto';

@Injectable()
export class DeliveryManMotorcycleService {
  constructor(
    private readonly userService: UserService,
    private readonly motorcycleService: MotorcycleService,
  ) {}

  async create(userDto: CreateUserDto, motorcycleDto: CreateMotorcycleDto) {
    const http400 = generateBadRequestException(
      'Informe o valor da diária do motoboy',
    );

    if (!userDto.daily) {
      throw http400;
    }

    const owner = motorcycleDto.owner
      ? await this.userService.findOneByOrFail({
          id: motorcycleDto.owner,
        })
      : undefined;

    const driver = motorcycleDto.driver
      ? await this.userService.findOneMotoboyByOrFail({
          id: motorcycleDto.driver,
        })
      : undefined;

    const newMotorcycle = await this.motorcycleService.create(
      motorcycleDto,
      owner,
      driver,
    );
    const newMotoboy = await this.userService.create(userDto, newMotorcycle);

    return this.userService.findOneMotoboyByOrFail({ id: newMotoboy.id });
  }
}
