import { Injectable } from '@nestjs/common';
import { UserService } from '../user.service';
import { MotorcycleService } from './motorcycle.service';
import { CreateUserDto } from '../dtos/user/create-user.dto';
import { Role as RoleEnum } from '../../common/role/roles.enum';
import { generateBadRequestException } from 'src/common/generate-exception';

@Injectable()
export class DeliveryManMotorcycleService {
  constructor(
    private readonly userService: UserService,
    private readonly motorcycleService: MotorcycleService,
  ) {}

  async create(dto: CreateUserDto) {
    if (dto.role === RoleEnum.Motoboy) {
      const http400 = generateBadRequestException(
        'Informe o valor da diária do motoboy',
      );

      if (!dto.daily) {
        throw http400;
      }

      const newMotorcycle = await this.motorcycleService.create({
        ...dto.motorcycle,
      });

      const newMotoboy = {
        ...newUser,
        daily: dto.daily,
        // motorcycle: newMotorcycle,
      };

      const created = await this.userService.saveDeliveryMan(newMotoboy);
      return this.userService.findOneByOrFail({ id: created.id });
    }
  }
}
