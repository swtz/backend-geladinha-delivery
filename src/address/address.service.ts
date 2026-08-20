import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  EntityManager,
  FindOptionsOrder,
  FindOptionsOrderValue,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
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

  create(dto: CreateAddressDto, isDefault = true, manager?: EntityManager) {
    const newAddress = this.generateAddress(dto, isDefault);
    return this.save(newAddress, manager);
  }

  async update(dto: UpdateAddressDto, id: string, manager?: EntityManager) {
    const address = await this.findOneByOrFail({ id }, false, manager);
    trimWhiteSpacesFromDto(dto, 4, 'number', 'stateCode', 'location');
    address.complement =
      dto.complement !== null ? dto.complement || address.complement : null;

    address.referencePoint =
      dto.referencePoint !== null
        ? dto.referencePoint || address.referencePoint
        : null;

    address.location =
      dto.location !== null ? dto.location || address.location : null;

    address.number = dto.number !== null ? dto.number || address.number : 'S/N';
    address.city = dto.city ?? address.city;
    address.neighborhood = dto.neighborhood ?? address.neighborhood;
    address.street = dto.street ?? address.street;
    address.postalCode = dto.postalCode
      ? formatBrPostalCode(dto.postalCode)
      : address.postalCode;
    address.stateCode = dto.stateCode ?? address.stateCode;
    // checar definição da instrução abaixo, pois isso pode dar problema
    // ao lançar uma entrega em que o recurso não encontre
    // nenhum Customer.addresses[0].isDefault === 'true';
    address.isDefault = !dto.isDefault ? address.isDefault : dto.isDefault;

    const updated = await this.save(address, manager);
    return this.findOneByOrFail({ id: updated.id }, false, manager);
  }

  generateAddress(dto: CreateAddressDto, isDefault = true) {
    trimWhiteSpacesFromDto(dto, 4, 'number', 'stateCode', 'location');
    const address = {
      street: dto.street,
      number: dto.number === null ? undefined : dto.number,
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

  async findOneByOrFail(
    addressData: FindOptionsWhere<Address>,
    relations = false,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(Address)
      : this.addressRepository;
    const address = await repo.findOne({
      where: addressData,
      relations: { customer: { addresses: relations } },
    });
    if (!address) {
      throw new NotFoundException('Endereço não encontrado');
    }
    return address;
  }

  async findOneOwnedOrFail(
    addressData: FindOptionsWhere<Address>,
    customerData: FindOptionsWhere<Customer>,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(Address)
      : this.addressRepository;
    const address = await repo.findOne({
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

  async findAll(
    queryParams: FindOptionsWhere<Address>,
    orderParams?: {
      [K in keyof FindOptionsOrder<Address>]: FindOptionsOrderValue;
    },
  ) {
    const addresses = await this.addressRepository.find({
      where: queryParams,
      relations: { customer: true },
      order: orderParams,
    });

    return addresses;
  }

  async remove(id: string, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(Address)
      : this.addressRepository;
    const address = await this.findOneByOrFail({ id }, true, manager);
    if (address.customer?.addresses.length === 1) {
      throw new UnprocessableEntityException(
        'Cliente precisa ter ao menos 1 endereço',
      );
    }
    if (address.isDefault) {
      throw new ForbiddenException(
        'Não é possível excluir o endereço que está como padrão',
      );
    }
    await repo.delete({ id });
    return address;
  }

  async save(address: Partial<Address>, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(Address)
      : this.addressRepository;
    return repo.save(address);
  }
}
