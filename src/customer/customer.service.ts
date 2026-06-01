import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AddressService } from 'src/address/address.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly addressService: AddressService,
  ) {}

  async failIfPhoneExists(phone: string, isSecondPhone = false) {
    const exists = await this.findByPhone(phone, isSecondPhone);

    if (exists) {
      throw new ConflictException('Telefone já existe');
    }
  }

  async failIfNicknameExists(nickname: string) {
    const exists = await this.customerRepository.existsBy({ nickname });

    if (exists) {
      throw new ConflictException(
        `O número ${nickname} já pertence a um cliente`,
      );
    }
  }

  async create(dto: CreateCustomerDto) {
    await this.failIfNicknameExists(dto.nickname);
    await this.failIfPhoneExists(dto.phone);

    if (dto.secondPhone) {
      await this.failIfPhoneExists(dto.secondPhone, true);
    }

    const customer = {
      name: dto.name,
      lastName: dto.lastName,
      nickname: dto.nickname,
      phone: dto.phone,
      secondPhone: dto.secondPhone,
    };

    return this.save(customer);
  }

  async update(dto: UpdateCustomerDto, id: string) {
    const existsCustomerData = Object.values(dto).filter(Boolean);
    const customer = await this.findOneByOrFail({ id });

    if (existsCustomerData.length === 0 && dto.address === undefined) {
      throw new BadRequestException('Dados não enviados');
    }

    if (existsCustomerData.length > 0) {
      if (dto.phone && dto.phone !== customer.phone) {
        await this.failIfPhoneExists(dto.phone);
        customer.phone = dto.phone;
      }

      customer.name = dto.name ?? customer.name;
    }

    if (dto.address && dto.address.id !== null) {
      if (dto.address.isDefault) {
        const address = await this.addressService.findOneOwnedOrFail(
          { isDefault: true },
          { id },
        );

        if (dto.address.id !== address.id) {
          await this.addressService.save({ ...address, isDefault: false });
        }
      }

      await this.addressService.update(dto.address, id);
    }

    await this.save(customer);

    return this.findOneByOrFail({ id });
  }

  findAll() {
    return this.customerRepository.find({
      order: { createdAt: 'DESC' },
      relations: { addresses: true },
    });
  }

  async findOneByOrFail(customerData: Partial<Customer>) {
    const customer = await this.findOneBy(customerData);

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return customer;
  }

  async findOneBy(customerData: Partial<Customer>) {
    return this.customerRepository.findOne({
      where: customerData,
      relations: { addresses: true },
    });
  }

  findByPhone(phone: string, isSecondPhone = false) {
    const qo: { phone: undefined | string; secondPhone: undefined | string } = {
      phone,
      secondPhone: undefined,
    };

    if (isSecondPhone) {
      qo.phone = undefined;
      qo.secondPhone = phone;
    }

    return this.customerRepository.findOneBy(qo);
  }

  async remove(id: string) {
    const customer = await this.findOneByOrFail({ id });
    await this.customerRepository.delete({ id });
    return customer;
  }

  async save(customer: Partial<Customer>) {
    return this.customerRepository.save(customer);
  }

  findAddressesByCustomer(customer: Partial<Customer>) {
    return this.addressService.findAllOwned(customer);
  }

  async addAddress(dto: CreateAddressDto, id: string) {
    if (dto.isDefault === undefined || dto.isDefault === null) {
      throw new BadRequestException(
        'Campo endereço padrão não pode estar vazio',
      );
    }

    const customer = await this.findOneByOrFail({ id });

    if (customer.addresses.length >= 3) {
      throw new BadRequestException(
        'Só é possível cadastrar 3 endereços por cliente',
      );
    }

    if (dto.isDefault) {
      const ownedAddress = await this.addressService.findOneOwnedOrFail(
        { isDefault: true },
        { id },
      );

      await this.addressService.save({ ...ownedAddress, isDefault: false });
    }

    await this.addressService.create(dto, dto.isDefault, customer);

    return this.findOneByOrFail({ id });
  }

  async removeAddress(id: string) {
    const address = await this.addressService.findOneByOrFail({ id });
    const customer = await this.findOneByOrFail({ id: address.customer.id });

    if (address.isDefault) {
      throw new BadRequestException(
        'Não é possível excluir o endereço que está como padrão',
      );
    }

    if (customer.addresses.length === 1) {
      throw new BadRequestException('Cliente precisa ter ao menos 1 endereço');
    }

    return this.addressService.remove(id);
  }
}
