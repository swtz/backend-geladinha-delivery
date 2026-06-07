import { AddressService } from 'src/address/address.service';
import { CustomerService } from '../services/customer.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { transformToLowerCase } from 'src/common/utils/transform-to-lower-case';
import { Injectable } from '@nestjs/common';

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

  // update()
  // if (dto.address && dto.address.id !== null) {
  //   if (dto.address.isDefault) {
  //     const address = await this.addressService.findOneOwnedOrFail(
  //       { isDefault: true },
  //       { id },
  //     );

  //     if (dto.address.id !== address.id) {
  //       await this.addressService.save({ ...address, isDefault: false });
  //     }
  //   }

  //   await this.addressService.update(dto.address, id);
  // }

  // findAddressesByCustomer(customer: Partial<Customer>) {
  //   return this.addressService.findAllOwned(customer);
  // }

  // async addAddress(dto: CreateAddressDto, id: string) {
  //   if (dto.isDefault === undefined || dto.isDefault === null) {
  //     throw new BadRequestException(
  //       'Campo endereço padrão não pode estar vazio',
  //     );
  //   }

  //   const customer = await this.findOneByOrFail({ id });

  //   if (customer.addresses.length >= 3) {
  //     throw new BadRequestException(
  //       'Só é possível cadastrar 3 endereços por cliente',
  //     );
  //   }

  //   if (dto.isDefault) {
  //     const ownedAddress = await this.addressService.findOneOwnedOrFail(
  //       { isDefault: true },
  //       { id },
  //     );

  //     await this.addressService.save({ ...ownedAddress, isDefault: false });
  //   }

  //   await this.addressService.create(dto, dto.isDefault, customer);

  //   return this.findOneByOrFail({ id });
  // }

  // async removeAddress(id: string) {
  //   const address = await this.addressService.findOneByOrFail({ id });
  //   const customer = await this.findOneByOrFail({ id: address.customer.id });

  //   if (address.isDefault) {
  //     throw new BadRequestException(
  //       'Não é possível excluir o endereço que está como padrão',
  //     );
  //   }

  //   if (customer.addresses.length === 1) {
  //     throw new BadRequestException('Cliente precisa ter ao menos 1 endereço');
  //   }

  //   return this.addressService.remove(id);
  // }
}
