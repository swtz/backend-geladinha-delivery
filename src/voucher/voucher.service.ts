import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { VoucherEntity } from './entities/voucher.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { DeliveryManService } from 'src/delivery-man/delivery-man.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { DeliveryManEntity } from 'src/delivery-man/entities/delivery-man.entity';
import { UpdateVoucherDto } from './dto/update-voucher.dto';

@Injectable()
export class VoucherService {
  private readonly logger = new Logger(VoucherService.name);

  constructor(
    @InjectRepository(VoucherEntity)
    private readonly voucherRepository: Repository<VoucherEntity>,
    private readonly deliveryManService: DeliveryManService,
  ) {}

  async create(
    dto: CreateVoucherDto,
    user: UserEntity | DeliveryManEntity,
    motoboyId: string,
  ) {
    const id = user instanceof DeliveryManEntity ? user.id : motoboyId;
    const deliveryMan = await this.deliveryManService.findOneOrFail({ id });

    const voucher = {
      amount: dto.amount,
      description: dto.description,
    };

    const created = await this.voucherRepository
      .save(voucher)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error('Erro ao criar a compra/vale', err.stack);
        }

        throw new BadRequestException('Erro ao criar a compra/vale');
      });

    deliveryMan.vouchers.push(created);

    await this.deliveryManService.save(deliveryMan);
    return created;
  }

  async update(
    dto: UpdateVoucherDto,
    user: UserEntity | DeliveryManEntity,
    motoboyId: string,
  ) {
    if (!dto.amount && !dto.description) {
      throw new BadRequestException('Dados não enviados');
    }

    const id = user instanceof DeliveryManEntity ? user.id : motoboyId;
    const deliveryMan = await this.deliveryManService.findOneOrFail({ id });

    const voucher = await this.findOneOwnedOrFail({ id: dto.id }, deliveryMan);

    voucher.amount = dto.amount ?? voucher.amount;
    voucher.description = dto.description ?? voucher.description;

    return this.voucherRepository.save(voucher);
  }

  async findOneOrFail(voucherData: Partial<VoucherEntity>) {
    const voucher = await this.voucherRepository.findOne({
      where: voucherData,
      relations: ['deliveryMan'],
    });

    if (!voucher) {
      throw new NotFoundException('Compra ou vale não encontrado');
    }

    return voucher;
  }

  async findOneByDeliveryMan(
    voucherData: Partial<VoucherEntity>,
    user: UserEntity | DeliveryManEntity,
  ) {
    if (user instanceof DeliveryManEntity) {
      return this.findOneOwnedOrFail(voucherData, user);
    }

    const voucher = await this.findOneOrFail(voucherData);
    const deliveryMan = await this.deliveryManService.findOneOrFail({
      id: voucher.deliveryMan.id,
    });

    return this.findOneOwnedOrFail({ id: voucher.id }, deliveryMan);
  }

  async findOneOwnedOrFail(
    voucherData: Partial<VoucherEntity>,
    motoboy: DeliveryManEntity,
  ) {
    const voucher = await this.voucherRepository.findOne({
      where: {
        ...voucherData,
        deliveryMan: { id: motoboy.id },
      },
      relations: ['deliveryMan'],
    });

    if (!voucher) {
      throw new NotFoundException('Compra ou vale não encontrado');
    }

    return voucher;
  }

  async findAllOwned(motoboyData: Partial<DeliveryManEntity>) {
    const vouchers = await this.voucherRepository.find({
      where: {
        deliveryMan: motoboyData,
      },
      relations: ['deliveryMan'],
    });

    return vouchers;
  }
}
