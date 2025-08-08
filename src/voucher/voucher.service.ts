import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { VoucherEntity } from './entities/voucher.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { DeliveryManService } from 'src/delivery-man/delivery-man.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { DeliveryEntity } from 'src/delivery/entities/delivery.entity';

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
    user: UserEntity | DeliveryEntity,
    motoboyId: string = '',
  ) {
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

    const id = user instanceof DeliveryEntity ? user.id : motoboyId;
    const deliveryMan = await this.deliveryManService.findOneOrFail({ id });

    deliveryMan.vouchers.push(created);

    await this.deliveryManService.save(deliveryMan);
    return created;
  }
}
