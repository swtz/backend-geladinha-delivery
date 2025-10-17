import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Tip } from './entities/tip.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Delivery } from 'src/delivery/entities/delivery.entity';
import { DeliveryMan } from 'src/user/entities/user.entity';
import { generateBadRequestException } from 'src/common/generate-exception';

@Injectable()
export class TipService {
  private readonly logger = new Logger(TipService.name);

  constructor(
    @InjectRepository(Tip)
    private readonly tipRepository: Repository<Tip>,
  ) {}

  create_new(amount: number, motoboy: DeliveryMan) {
    return this.save({ amount, motoboy });
  }

  create(amount: number) {
    return this.save({ amount });
  }

  async createReplaceAndPush(
    amount: number,
    delivery: Delivery,
    motoboy: DeliveryMan,
  ) {
    const tip = await this.create(amount);
    delivery.tip = tip;
    motoboy.tips.push(tip);
  }

  async update(tipData: Partial<Tip>) {
    if (!tipData.id) {
      throw new BadRequestException('O ID da gorjeta é obrigatório');
    }

    const tip = await this.findOneByOrFail({ id: tipData.id });

    tip.amount = tipData.amount ?? tip.amount;
    tip.motoboy = tipData.motoboy ?? tip.motoboy;

    return this.save(tip);
  }

  async findOneByOrFail(tipData: Partial<Tip>) {
    const tip = await this.findOneBy(tipData);

    if (!tip) {
      throw new NotFoundException('Gorjeta não encontrada');
    }

    return tip;
  }

  findOneBy(tipData: Partial<Tip>) {
    return this.tipRepository.findOne({
      where: {
        ...tipData,
        motoboy: { id: tipData.motoboy?.id },
      },
      relations: { motoboy: true },
    });
  }

  async remove(id: string) {
    const tip = await this.findOneByOrFail({ id });
    await this.tipRepository.delete({ id });
    return tip;
  }

  async save(tip: Partial<Tip>) {
    const http400 = generateBadRequestException('Erro ao salvar gorjeta');
    const created = await this.tipRepository.save(tip).catch((err: unknown) => {
      if (err instanceof Error) {
        this.logger.error(http400.message, err.stack);
      }

      throw http400;
    });

    return created;
  }
}
