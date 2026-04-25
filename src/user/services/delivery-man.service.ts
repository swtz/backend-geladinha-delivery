import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DeliveryMan } from '../entities/delivery-man.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DeliveryManService {
  constructor(
    @InjectRepository(DeliveryMan)
    private readonly deliveryManRepository: Repository<DeliveryMan>,
  ) {}

  async updateMotoboyFields(
    existsMotoboyData: boolean,
    dto: UpdateUserDto,
    user: User,
  ) {
    if (!existsMotoboyData) {
      throw new BadRequestException('Dados do motoboy não enviados');
    }

    const motoboy = await this.findOneMotoboyByOrFail({ id: user.id });

    // motoboy.motorcycle = dto.motorcycle ?? motoboy.motorcycle;
    // MotorcycleService.update()

    motoboy.daily = dto.daily ?? motoboy.daily;

    return motoboy;
  }

  async findAllMotoboy() {
    const motoboys = await this.deliveryManRepository.find({
      order: { createdAt: 'DESC' },
      relations: essencial,
    });

    return motoboys;
  }

  async findOneMotoboyByOrFail(userData: Partial<User>, relations = true) {
    const fields = relations ? full : essencial;
    const motoboy = await this.deliveryManRepository.findOne({
      where: userData,
      relations: fields,
    });

    if (!motoboy) {
      throw new NotFoundException('Motoboy não encontrado');
    }

    return motoboy;
  }

  async saveDeliveryMan(user: Partial<DeliveryMan>) {
    const http400 = generateBadRequestException('Erro ao criar o motoboy');
    const created = await this.deliveryManRepository
      .save(user)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error(http400.message, err.stack);
        }

        throw http400;
      });

    return created;
  }
}
