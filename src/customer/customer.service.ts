import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AddressService } from 'src/address/address.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

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
    const address = await this.addressService.create(dto.address);
    const created = this.customerRepository.create(newCustomer);

    created.addresses.push(address);

    return this.save(created);
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
