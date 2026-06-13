import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { formatPhone } from 'src/common/utils/format-phone';
import { transformToLowerCase } from 'src/common/utils/transform-to-lower-case';
import { Service } from 'src/common/protocols/service/service';

@Injectable()
export class CustomerService implements Service {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}
  transformDtoFields<T extends object>(dto: T): T {
    if (typeof dto !== 'object') {
      throw new UnprocessableEntityException('Formato não permitido');
    }

    const copy = { ...dto };
    const arrayDto = Object.entries(copy);

    arrayDto.forEach(([k, v]) => {
      if (typeof v === 'string') {
        copy[k] = transformToLowerCase(v);
      }
    });

    return copy;
  }

  async failIfPhoneExists(
    phone: string,
    isSecondPhone = false,
    manager?: EntityManager,
  ) {
    const exists = await this.findByPhone(phone, isSecondPhone, manager);

    if (exists) {
      throw new ConflictException('Telefone já existe');
    }
  }

  async failIfNicknameExists(nickname: string, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(Customer)
      : this.customerRepository;
    const exists = await repo.existsBy({ nickname });
    if (exists) {
      throw new ConflictException(
        `O número ${nickname} já pertence a um cliente`,
      );
    }
  }

  async failIfEmailExists(email: string, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(Customer)
      : this.customerRepository;
    const exists = await repo.existsBy({ email });
    if (exists) {
      throw new ConflictException(
        `O endereço ${email} já pertence a um cliente`,
      );
    }
  }

  async create(dto: CreateCustomerDto, manager?: EntityManager) {
    await this.failIfNicknameExists(dto.nickname, manager);
    await this.failIfPhoneExists(dto.phone, false, manager);

    if (dto.secondPhone) {
      await this.failIfPhoneExists(dto.secondPhone, true, manager);
    }

    const customer = {
      name: dto.name,
      lastName: dto.lastName,
      nickname: dto.nickname,
      phone: formatPhone(dto.phone),
      secondPhone: dto.secondPhone ? formatPhone(dto.secondPhone) : undefined,
    };

    return this.save(customer, manager);
  }

  async update(dto: UpdateCustomerDto, id: string) {
    const customer = await this.findOneByOrFail({ id });
    const parsedDto = this.transformDtoFields<UpdateCustomerDto>(dto);

    customer.name = parsedDto.name ?? customer.name;
    customer.lastName = parsedDto.lastName ?? customer.lastName;
    customer.nickname = parsedDto.nickname ?? customer.nickname;
    customer.phone = parsedDto.phone
      ? formatPhone(parsedDto.phone)
      : customer.phone;
    customer.secondPhone = parsedDto.secondPhone
      ? formatPhone(parsedDto.secondPhone)
      : customer.secondPhone;
    customer.email = parsedDto.email ?? customer.email;

    const updated = await this.save(customer);
    return this.findOneByOrFail({ id: updated.id });
  }

  findAll() {
    return this.customerRepository.find({
      order: { createdAt: 'DESC' },
      relations: { addresses: true },
    });
  }

  async findOneByOrFail(
    customerData: Partial<Customer>,
    manager?: EntityManager,
  ) {
    const customer = await this.findOneBy(customerData, manager);

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return customer;
  }

  async findOneBy(customerData: Partial<Customer>, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(Customer)
      : this.customerRepository;
    return repo.findOne({
      where: customerData,
      relations: { addresses: true },
    });
  }

  findByPhone(phone: string, isSecondPhone = false, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(Customer)
      : this.customerRepository;
    const qo: { phone: undefined | string; secondPhone: undefined | string } = {
      phone,
      secondPhone: undefined,
    };

    if (isSecondPhone) {
      qo.phone = undefined;
      qo.secondPhone = phone;
    }

    return repo.findOneBy(qo);
  }

  async remove(id: string) {
    const customer = await this.findOneByOrFail({ id });
    await this.customerRepository.delete({ id });
    return customer;
  }

  async save(customer: Partial<Customer>, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(Customer)
      : this.customerRepository;
    return repo.save(customer);
  }
}
