import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { VoucherService } from 'src/voucher/voucher.service';
import { Repository } from 'typeorm';
import { DeliveryManEntity } from './entities/delivery-man.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDeliveryManDto } from './dto/create-delivery-man.dto';
import { HashingService } from 'src/common/hashing/hashing.service';

@Injectable()
export class DeliveryManService {
  private readonly logger = new Logger(DeliveryManService.name);

  constructor(
    @InjectRepository(DeliveryManEntity)
    private readonly deliveryManRepository: Repository<DeliveryManEntity>,
    private readonly voucherService: VoucherService,
    private readonly hashingService: HashingService,
  ) {}

  async create(dto: CreateDeliveryManDto) {
    await this.failIfEmailExists(dto.email);

    const hashedPassword = await this.hashingService.hash(dto.password);
    const deliveryMan = {
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      password: hashedPassword,
      motorcycle: dto.motorcycle,
      daily: dto.daily,
    };

    const created = await this.deliveryManRepository
      .save(deliveryMan)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error('Erro ao criar o Motoboy', err.stack);
        }

        throw new BadRequestException('Erro ao criar o Motoboy');
      });

    return created;
  }

  async failIfEmailExists(email: string) {
    const exists = await this.findByEmail(email);

    if (exists) {
      throw new ConflictException('Email já existe');
    }
  }

  findByEmail(email: string) {
    return this.deliveryManRepository.findOneBy({ email });
  }
}
