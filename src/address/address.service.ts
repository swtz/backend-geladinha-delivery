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
import { generateBadRequestException } from 'src/common/generate-exception';
import { formatBrPostalCode } from 'src/common/utils/format-br-postal-code';
import { trimWhiteSpacesFromDto } from 'src/common/utils/trim-white-spaces-from-dto';

@Injectable()
export class AddressService {
  private readonly logger = new Logger(AddressService.name);

  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  create(dto: CreateAddressDto, isDefault = true) {
    trimWhiteSpacesFromDto(dto, 4, 'stateCode', 'neighborhood', 'location');

    const newAddress = {
      street: dto.street,
      number: dto.number,
      complement: dto.complement,
      referencePoint: dto.referencePoint,
      neighborhood: dto.neighborhood,
      postalCode: dto.postalCode
        ? formatBrPostalCode(dto.postalCode)
        : undefined,
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

    const ownedAddress = await this.findOneOwnedOrFail(
      { id: dto.id },
      {
        id: customerId,
      },
    );

    trimWhiteSpacesFromDto(dto, 4, 'stateCode', 'neighborhood', 'location');

    ownedAddress.city = dto.city ?? ownedAddress.city;
    ownedAddress.complement = dto.complement ?? ownedAddress.complement;
    ownedAddress.neighborhood = dto.neighborhood ?? ownedAddress.neighborhood;
    ownedAddress.referencePoint =
      dto.referencePoint ?? ownedAddress.referencePoint;
    ownedAddress.street = dto.street ?? ownedAddress.street;
    ownedAddress.number = dto.number ?? ownedAddress.number;
    ownedAddress.postalCode = dto.postalCode
      ? formatBrPostalCode(dto.postalCode)
      : ownedAddress.postalCode;
    ownedAddress.location = dto.location ?? ownedAddress.location;
    ownedAddress.stateCode = dto.stateCode ?? ownedAddress.stateCode;
    ownedAddress.isDefault = !dto.isDefault
      ? ownedAddress.isDefault
      : dto.isDefault;

    const nullableValues = {
      complement: dto.complement,
      referencePoint: dto.referencePoint,
      number: dto.number,
    };
    const updatedValues = {};

    Object.keys(nullableValues).forEach(key => {
      if (nullableValues[key] === null) {
        updatedValues[key] = '';

        if (key === 'number') {
          updatedValues[key] = 'S/N';
        }
      }
    });

    return this.save({ ...ownedAddress, ...updatedValues });
  }

  async findOneByOrFail(addressData: Partial<Address>) {
    const address = await this.addressRepository.findOne({
      where: addressData,
      relations: { customer: true },
    });

    if (!address) {
      throw new NotFoundException('Endereço não encontrado');
    }

    return address;
  }

  async findOneOwnedOrFail(
    addressData: Partial<Address>,
    customerData: Partial<Customer>,
  ) {
    const address = await this.addressRepository.findOne({
      where: {
        ...addressData,
        customer: customerData,
      },
      relations: { customer: true },
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
      relations: { customer: true },
    });

    return addresses;
  }

  async remove(id: string) {
    const address = await this.findOneByOrFail({ id });
    await this.addressRepository.delete({ id });
    return address;
  }

  async save(address: Partial<Address>) {
    const http400 = generateBadRequestException('Erro ao salvar endereço');
    const created = await this.addressRepository
      .save(address)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error(http400.message, err.stack);
        }

        throw http400;
      });

    return created;
  }
}
