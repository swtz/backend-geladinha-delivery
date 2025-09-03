import {
  BadRequestException,
  Injectable,
  Logger,
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
  private readonly logger = new Logger(CustomerService.name);

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly addressService: AddressService,
  ) {}

  async failIfPhoneExists(phone: string) {
    const exists = await this.customerRepository.existsBy({ phone });

    if (exists) {
      throw new BadRequestException(
        `O número ${phone} já pertence a um cliente`,
      );
    }
  }

  async create(dto: CreateCustomerDto) {
    await this.failIfPhoneExists(dto.phone);

    const newCustomer = {
      name: dto.name,
      phone: dto.phone,
    };
    const address = await this.addressService.create(dto.address);
    const created = await this.save(newCustomer);
    const customer = await this.customerRepository.findOneOrFail({
      where: {
        id: created.id,
      },
      relations: ['addresses'],
    });

    customer.addresses.push(address);

    return this.save(customer);
  }

  async update(dto: UpdateCustomerDto, id: string) {
    const existsCustomerData = dto.name || dto.phone;
    const customer = await this.findOneByOrFail({ id });

    if (!existsCustomerData && dto.address === undefined) {
      throw new BadRequestException('Dados não enviados');
    }

    if (existsCustomerData) {
      if (dto.phone && dto.phone !== customer.phone) {
        await this.failIfPhoneExists(dto.phone);
        customer.phone = dto.phone;
      }

      customer.name = dto.name ?? customer.name;
    }

    if (dto.address && dto.address.id !== null) {
      await this.addressService.update(dto.address, id);
    }

    const updatedCustomer = await this.save(customer);

    return this.findOneByOrFail({ id: updatedCustomer.id });
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
      relations: ['addresses'],
    });
  }

  async save(customer: Partial<Customer>) {
    const created = await this.customerRepository
      .save(customer)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error('Erro ao criar cliente', err.stack);
        }

        throw new BadRequestException('Erro ao criar cliente');
      });

    return created;
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

    const address = await this.addressService.create(dto, dto.isDefault);

    if (dto.isDefault) {
      void customer.addresses.map(async address => {
        await this.addressService.save({ ...address, isDefault: false });
      });
    }

    customer.addresses.push(address);

    return this.save({ ...customer, addresses: customer.addresses });
  }

  async removeAddress(id: string) {
    const address = await this.addressService.findOneByOrFail(id);
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
