import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { VoucherEntity } from './entities/voucher.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateVoucherDto } from './dto/create-voucher.dto';

@Injectable()
export class VoucherService {
  private readonly logger = new Logger(VoucherService.name);

  constructor(
    @InjectRepository(VoucherEntity)
    private readonly voucherRepository: Repository<VoucherEntity>,
  ) {}

  async create(dto: CreateVoucherDto) {
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

    return created;
  }
}
