import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { VoucherService } from 'src/voucher/voucher.service';
import { Repository } from 'typeorm';
import { DeliveryManEntity } from './entities/delivery-man.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDeliveryManDto } from './dto/create-delivery-man.dto';
import { HashingService } from 'src/common/hashing/hashing.service';
import { UpdateDeliveryManDto } from './dto/update-delivery-man.dto';

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

  async update(dto: UpdateDeliveryManDto, id: string) {
    const existsData =
      dto.name ||
      dto.email ||
      dto.phone ||
      dto.motorcycle ||
      dto.daily ||
      dto.tip ||
      dto.voucher?.amount;

    if (!existsData) {
      throw new BadRequestException('Dados não enviados');
    }

    const deliveryMan = await this.findOneOrFail({ id });

    deliveryMan.name = dto.name ?? deliveryMan.name;
    deliveryMan.phone = dto.phone ?? deliveryMan.phone;
    deliveryMan.motorcycle = dto.motorcycle ?? deliveryMan.motorcycle;
    deliveryMan.daily = dto.daily ?? deliveryMan.daily;
    deliveryMan.tip = dto.tip ?? deliveryMan.tip;

    if (dto.email && dto.email !== deliveryMan.email) {
      await this.failIfEmailExists(dto.email);
      deliveryMan.email = dto.email;
      deliveryMan.forceLogout = true;
    }

    if (dto.voucher) {
      const voucher = await this.voucherService.create(dto.voucher);
      deliveryMan.vouchers.push(voucher);
    }

    return this.save(deliveryMan);
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

  findById(id: string) {
    return this.deliveryManRepository.findOneBy({ id });
  }

  async findOneOrFail(deliveryManData: Partial<DeliveryManEntity>) {
    const deliveryMan = await this.deliveryManRepository.findOne({
      where: deliveryManData,
      relations: ['vouchers'],
    });

    if (!deliveryMan) {
      throw new NotFoundException('Motoboy não encontrado');
    }

    return deliveryMan;
  }

  async findAll() {
    const deliveryMans = await this.deliveryManRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['vouchers'],
    });

    return deliveryMans;
  }

  async remove(id: string) {
    const deliveryMan = await this.findOneOrFail({ id });
    await this.deliveryManRepository.delete({ id });
    return deliveryMan;
  }

  save(deliveryMan: DeliveryManEntity) {
    return this.deliveryManRepository.save(deliveryMan);
  }
}
