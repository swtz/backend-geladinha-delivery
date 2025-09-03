import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAddressDto } from './dto/create-address.dto';
import { Customer } from 'src/customer/entities/customer.entity';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  private readonly logger = new Logger(AddressService.name);

  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  create(dto: CreateAddressDto, isDefault = true) {
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
      isDefault,
    };

    return this.save(newAddress);
  }

  async update(dto: UpdateAddressDto, customerId: string) {
    if (!dto.id) {
      throw new BadRequestException('Campo ID não pode estar vazio');
    }

    const ownedAddress = await this.findOneOwnedOrFail(dto.id, {
      id: customerId,
    });

    ownedAddress.city = dto.city ?? ownedAddress.city;
    ownedAddress.complement = dto.complement ?? ownedAddress.complement;
    ownedAddress.neighborhood = dto.neighborhood ?? ownedAddress.neighborhood;
    ownedAddress.referencePoint =
      dto.referencePoint ?? ownedAddress.referencePoint;
    ownedAddress.street = dto.street ?? ownedAddress.street;
    ownedAddress.number = dto.number ?? ownedAddress.number;
    ownedAddress.postalCode = dto.postalCode ?? ownedAddress.postalCode;
    ownedAddress.location = dto.location ?? ownedAddress.location;
    ownedAddress.stateCode = dto.stateCode ?? ownedAddress.stateCode;
    ownedAddress.isDefault = dto.isDefault ?? ownedAddress.isDefault;

    const nullableValues = {
      complement: dto.complement,
      referencePoint: dto.referencePoint,
      number: dto.number,
    };
    const updatedValues = {};

    Object.keys(nullableValues).forEach(key => {
      if (nullableValues[key] === null) {
        if (key === 'number') {
          updatedValues['number'] = 'S/N';
        }

        updatedValues[key] = '';
      }
    });

    return this.save({ ...ownedAddress, ...updatedValues });
  }

  async findOneByOrFail(id: string) {
    return this.addressRepository.findOneByOrFail({ id });
  }

  async findOneOwnedOrFail(id: string, customerData: Partial<Customer>) {
    const address = await this.addressRepository.findOne({
      where: {
        id,
        customer: customerData,
      },
      relations: ['customer'],
    });

    if (!address) {
      throw new NotFoundException('Endereço não encontrado');
    }

    return address;
  }

  async findAllOwned(customerData: Partial<Customer>) {
    const addresses = await this.addressRepository.find({
      where: {
        customer: customerData,
      },
      relations: ['customer'],
    });

    return addresses;
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
