import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class AddressService {
  private readonly logger = new Logger(AddressService.name);

  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  create(dto: CreateAddressDto) {
    const newAddress = {
      street: dto.street,
      number: dto.number,
      complement: dto.complement,
      referencePoint: dto.referencePoint,
      neighborhood: dto.neighborhood,
      postalCode: dto.postalCode,
      city: dto.city,
      stateCode: dto.stateCode,
      location: dto.location,
      isDefault: dto.isDefault,
    };

    return this.save(newAddress);
  }

  async save(address: Partial<Address>) {
    const created = await this.addressRepository
      .save(address)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error('Erro ao criar endereço', err.stack);
        }

        throw new BadRequestException('Erro ao criar endereço');
      });

    return created;
  }
}
