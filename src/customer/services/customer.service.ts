import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
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

  async failIfEmailExists(email: string) {
    const exists = await this.customerRepository.existsBy({ email });

    if (exists) {
      throw new ConflictException(
        `O endereço ${email} já pertence a um cliente`,
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
      phone: formatPhone(dto.phone),
      secondPhone: dto.secondPhone ? formatPhone(dto.secondPhone) : undefined,
    };

    return this.save(customer);
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
}
