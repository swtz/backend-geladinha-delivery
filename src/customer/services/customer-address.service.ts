import { AddressService } from 'src/address/address.service';
import { CustomerService } from '../services/customer.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { transformToLowerCase } from 'src/common/utils/transform-to-lower-case';
import {
  ForbiddenException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';

@Injectable()
export class CustomerAddressService {
  constructor(
    private readonly addressService: AddressService,
    private readonly customerService: CustomerService,
  ) {}

  async create(customerDto: CreateCustomerDto, addressDto: CreateAddressDto) {
    const arrayDto = Object.entries(customerDto);

    arrayDto.forEach(([k, v]) => {
      if (typeof v === 'string') {
        customerDto[k] = transformToLowerCase(v);
      }
    });

    const customer = await this.customerService.create(customerDto);
    const address = await this.addressService.create(addressDto);
    const created = await this.customerService.save({
      ...customer,
      addresses: [address],
    });

    return this.customerService.findOneByOrFail({ id: created.id });
  }

  async addAddress(dto: CreateAddressDto, id: string) {
    const customer = await this.customerService.findOneByOrFail({ id });
    const wantsDefault = !!dto.isDefault;

    if (customer.addresses.length >= 3) {
      throw new UnprocessableEntityException(
        'Só é possível cadastrar 3 endereços no máximo',
      );
    }
    if (wantsDefault) {
      const defaultAddress = await this.addressService.findOneOwnedOrFail(
        { isDefault: true },
        { id },
      );

      await this.addressService.save({ ...defaultAddress, isDefault: false });
    }
    const address = await this.addressService.create(dto, wantsDefault);
    customer.addresses.push(address);
    const updated = await this.customerService.save(customer);
    return this.customerService.findOneByOrFail({ id: updated.id });
  }

  async removeAddress(id: string) {
    const address = await this.addressService.findOneByOrFail({ id });
    const customer = await this.customerService.findOneByOrFail({
      id: address.customer.id,
    });

    if (customer.addresses.length === 1) {
      throw new UnprocessableEntityException(
        'Cliente precisa ter ao menos 1 endereço',
      );
    }
    if (address.isDefault) {
      throw new ForbiddenException(
        'Não é possível excluir o endereço que está como padrão',
      );
    }
    return this.addressService.remove(id);
  }
}
