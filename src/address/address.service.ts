import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAddressDto } from './dto/create-address.dto';
import { Customer } from 'src/customer/entities/customer.entity';
import { UpdateAddressDto } from './dto/update-address.dto';
import { formatBrPostalCode } from 'src/common/utils/format-br-postal-code';
import { trimWhiteSpacesFromDto } from 'src/common/utils/trim-white-spaces-from-dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  create(dto: CreateAddressDto | UpdateAddressDto, isDefault = true) {
    trimWhiteSpacesFromDto(dto, 4, 'number', 'stateCode', 'location');
    const newAddress = this.generateAddress(dto, isDefault);
    return this.save(newAddress);
  }

  async update(dto: UpdateAddressDto, id: string) {
    const address = await this.findOneByOrFail({ id });
    trimWhiteSpacesFromDto(dto, 4, 'number', 'stateCode', 'location');

    address.city = dto.city ?? address.city;
    address.complement = dto.complement ?? address.complement;
    address.neighborhood = dto.neighborhood ?? address.neighborhood;
    address.referencePoint = dto.referencePoint ?? address.referencePoint;
    address.street = dto.street ?? address.street;
    address.number = dto.number ?? address.number;
    address.postalCode = dto.postalCode
      ? formatBrPostalCode(dto.postalCode)
      : address.postalCode;
    address.location = dto.location ?? address.location;
    address.stateCode = dto.stateCode ?? address.stateCode;
    address.isDefault = !dto.isDefault ? address.isDefault : dto.isDefault;

    Object.keys(dto).forEach(key => {
      if (dto[key] === null) {
        address[key] = '';

        if (key === 'number') {
          address[key] = 'S/N';
        }
      }
    });
    const updated = await this.save(address);
    return this.findOneByOrFail({ id: updated.id });
  }

  generateAddress(dto: CreateAddressDto | UpdateAddressDto, isDefault = true) {
    const address: Partial<Address> = {
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

    return address;
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
    return this.addressRepository.save(address);
  }
}
