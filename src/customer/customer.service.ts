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

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly addressService: AddressService,
  ) {}

  async create(dto: CreateCustomerDto) {
    const exists = await this.customerRepository.existsBy({ phone: dto.phone });

    if (exists) {
      throw new BadRequestException(
        `O número ${dto.phone} já pertence a um cliente`,
      );
    }

    const newCustomer = {
      name: dto.name,
      phone: dto.phone,
    };
    const address = await this.addressService.create(dto);
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

    if (!existsCustomerData && dto.addressId === undefined) {
      throw new BadRequestException('Dados não enviados');
    }

    if (existsCustomerData) {
      if (dto.phone && dto.phone !== customer.phone) {
        const exists = await this.customerRepository.existsBy({
          phone: dto.phone,
        });

        if (exists) {
          throw new BadRequestException(
            `O número ${dto.phone} já pertence a um cliente`,
          );
        }

        customer.phone = dto.phone;
      }

      customer.name = dto.name ?? customer.name;
    }

    if (dto.addressId !== undefined) {
      await this.addressService.update(dto, id);
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
}
