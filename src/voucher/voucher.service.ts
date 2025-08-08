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
    const voucher = await this.findOneOrFail({ id: dto.id });
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
}
