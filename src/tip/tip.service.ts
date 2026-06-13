import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { Tip } from './entities/tip.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeliveryMan } from 'src/user/entities/delivery-man.entity';

@Injectable()
export class TipService {
  constructor(
    @InjectRepository(Tip)
    private readonly tipRepository: Repository<Tip>,
  ) {}

  create(amount: number, motoboy: DeliveryMan, manager?: EntityManager) {
    return this.save({ amount, motoboy }, manager);
  }

  async update(tipData: Partial<Tip>, manager?: EntityManager) {
    const tip = await this.findOneByOrFail({ id: tipData.id }, manager);
    tip.amount = tipData.amount ?? tip.amount;
    tip.motoboy = tipData.motoboy ?? tip.motoboy;

    return this.save(tip, manager);
  }

  async findOneByOrFail(tipData: Partial<Tip>, manager?: EntityManager) {
    const tip = await this.findOneBy(tipData, manager);

    if (!tip) {
      throw new NotFoundException('Gorjeta não encontrada');
    }

    return tip;
  }

  async findOneBy(tipData: Partial<Tip>, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Tip) : this.tipRepository;
    return repo.findOne({
      where: {
        ...tipData,
        motoboy: { id: tipData.motoboy?.id },
      },
      relations: { motoboy: true },
    });
  }

  async remove(id: string, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Tip) : this.tipRepository;
    const tip = await this.findOneByOrFail({ id }, manager);
    await repo.delete({ id });
    return tip;
  }

  async save(tip: Partial<Tip>, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Tip) : this.tipRepository;
    return repo.save(tip);
  }
}
