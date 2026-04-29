import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payout } from './entities/payout.entity';
import { Repository } from 'typeorm';
import { DeliveryService } from 'src/delivery/delivery.service';
import { UserService } from 'src/user/user.service';
import { setDecimalPlaces } from 'src/common/utils/set-decimal-places';
import { VoucherService } from 'src/voucher/voucher.service';
import { User } from 'src/user/entities/user.entity';
import { DeliveryMan } from 'src/user/entities/delivery-man.entity';
import { WeekDay, weekDays } from 'src/common/enums/weekDays.enum';
import voucherRelations from '../voucher/data/relations/voucher';
import { Role } from 'src/common/role/roles.enum';
import { Voucher } from 'src/voucher/enums/voucher.enum';
import { WorkTimeDateService } from 'src/place/services/work-time-date.service';

@Injectable()
export class PayoutService {
  constructor(
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
    private readonly deliveryService: DeliveryService,
    private readonly userService: UserService,
    private readonly voucherService: VoucherService,
    private readonly workTimeDateService: WorkTimeDateService,
  ) {}

  async preview(motoboyData: Partial<DeliveryMan>, from: Date, to: Date) {
    if (Object.keys(motoboyData).length === 0) {
      throw new BadRequestException('Informe os dados para consulta');
    }

    const motoboy = await this.userService.findOneMotoboyByOrFail(motoboyData);
    const vouchers = await this.voucherService.findAll({
      from,
      to,
      type: Voucher.User,
      userData: motoboyData,
    });

    const deliveries = await this.deliveryService.findAll({
      from,
      to,
      type: Role.Motoboy,
      userData: motoboyData,
    });

    const motoboyTips = deliveries.reduce((prev, item) => {
      if (item.tip !== null) {
        return (prev += item.tip.amount);
      }
      return prev;
    }, 0);

    const payout = {
      weekDay: weekDays[from.getDay()],
      workDay: from,
      totalDeliveries: 0,
      motoboyDaily: 0,
      motoboyTips,
      subtotal: 0,
      totalSpending: 0,
      total: 0,
      motoboy,
      vouchers,
    };

    if (deliveries.length > 1) {
      payout.totalDeliveries = await this.deliveryService.sumDeliveryTaxCol({
        userData: motoboyData,
        from,
        to,
      });
    } else if (deliveries.length === 1) {
      const [delivery] = deliveries;

      payout.totalDeliveries = delivery.deliveryTax;
    }

    payout.motoboyDaily = motoboy.daily;
    payout.subtotal = setDecimalPlaces(
      payout.motoboyDaily + payout.totalDeliveries + payout.motoboyTips,
      2,
    );

    payout.totalSpending = await this.voucherService.sum({
      from,
      to,
      type: Voucher.User,
      userData: motoboyData,
    });

    payout.total = setDecimalPlaces(payout.subtotal - payout.totalSpending, 2);

    const lastPayouts = await this.findAll({
      isClosed: true,
      motoboy: { id: motoboy.id },
    });

    if (lastPayouts.length === 0) {
      return payout;
    }

    const lastPayout = lastPayouts[0];

    if (from.valueOf() <= lastPayout.workDay.valueOf()) {
      return payout;
    }

    if (lastPayout.total < 0) {
      payout.total = setDecimalPlaces(payout.total + lastPayout.total, 2);
    }

    return payout;
  }

  async create(
    payoutData: Partial<Omit<Payout, 'workDay' | 'motoboy'>> & {
      workDay: Date;
      motoboy: DeliveryMan;
    },
  ) {
    const exists = await this.findOneByWorkDayAndMotoboy(payoutData.workDay, {
      id: payoutData.motoboy.id,
    });

    if (exists) {
      const motoboyName = exists.motoboy.name;

      throw new ConflictException(
        `Já existe um pagamento lançado para esse dia.\nMotoboy: ${motoboyName}`,
      );
    }

    return this.save(payoutData);
  }

  async update(id: string, toDate: string) {
    const payout = await this.findOneByOrFail({ id });

    if (payout.isClosed) {
      throw new UnauthorizedException(
        'Não é possível alterar um pagamento fechado',
      );
    }

    const { workDay: initDate, motoboy } = payout;
    const { endDate: to } = await this.workTimeDateService.create(
      { id: motoboy.id },
      new Date(0).toISOString(),
      toDate,
    );

    const newPayout = await this.preview({ id: motoboy.id }, initDate, to);
    const mergedPayout = {
      ...payout,
      ...newPayout,
    };

    return this.save(mergedPayout);
  }

  async updateIsClosed(id: string, flag: boolean) {
    const payout = await this.findOneByOrFail({ id });
    payout.isClosed = flag;
    return this.save(payout);
  }

  async findOneByOrFail(payoutData: Partial<Payout>) {
    const payout = await this.findOneBy(payoutData);

    if (!payout) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    return payout;
  }

  findOneBy(payoutData: Partial<Payout>) {
    return this.payoutRepository.findOne({
      where: payoutData,
      relations: {
        motoboy: { workTime: true },
        vouchers: voucherRelations,
      },
    });
  }

  findOneByWorkDayAndMotoboy(workDay: Date, motoboyData: Partial<DeliveryMan>) {
    return this.payoutRepository.findOne({
      where: {
        workDay,
        motoboy: motoboyData,
      },
      relations: { motoboy: true },
    });
  }

  findAllOwned(user: User) {
    return this.payoutRepository.find({
      where: {
        motoboy: { id: user.id },
      },
      order: { workDay: 'DESC' },
      relations: { motoboy: true },
    });
  }

  findAll(queryParams: {
    weekDay?: WeekDay;
    workDay?: Date;
    motoboy?: Partial<DeliveryMan>;
    isClosed?: boolean;
  }) {
    return this.payoutRepository.find({
      where: queryParams,
      order: { workDay: 'DESC' },
      relations: { motoboy: true },
    });
  }

  async remove(id: string) {
    const payout = await this.findOneByOrFail({ id });

    if (payout.isClosed) {
      throw new UnauthorizedException(
        'Não é possível remover um pagamento fechado',
      );
    }

    await this.payoutRepository.delete({ id });
    return payout;
  }

  async save(payout: Partial<Payout>) {
    return this.payoutRepository.save(payout);
  }
}
