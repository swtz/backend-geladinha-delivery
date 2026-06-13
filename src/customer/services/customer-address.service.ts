import { AddressService } from 'src/address/address.service';
import { CustomerService } from '../services/customer.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { transformToLowerCase } from 'src/common/utils/transform-to-lower-case';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class CustomerAddressService {
  constructor(
    private readonly addressService: AddressService,
    private readonly customerService: CustomerService,
    private readonly dataSource: DataSource,
  ) {}

  async create(customerDto: CreateCustomerDto, addressDto: CreateAddressDto) {
    return this.dataSource.transaction(async manager => {
      const arrayDto = Object.entries(customerDto);

      arrayDto.forEach(([k, v]) => {
        if (typeof v === 'string') {
          customerDto[k] = transformToLowerCase(v);
        }
      });

      const customer = await this.customerService.create(customerDto, manager);
      const address = await this.addressService.create(
        addressDto,
        true,
        manager,
      );
      const created = await this.customerService.save(
        {
          ...customer,
          addresses: [address],
        },
        manager,
      );

      return this.customerService.findOneByOrFail({ id: created.id }, manager);
    });
  }

  async addAddress(dto: CreateAddressDto, id: string) {
    return this.dataSource.transaction(async manager => {
      const customer = await this.customerService.findOneByOrFail(
        { id },
        manager,
      );
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
          manager,
        );

        await this.addressService.save(
          { ...defaultAddress, isDefault: false },
          manager,
        );
      }
      const address = await this.addressService.create(
        dto,
        wantsDefault,
        manager,
      );
      customer.addresses.push(address);
      const updated = await this.customerService.save(customer, manager);
      return this.customerService.findOneByOrFail({ id: updated.id }, manager);
    });
  }

  async removeAddress(id: string) {
    return this.dataSource.transaction(async manager => {
      return this.addressService.remove(id, manager);
    });
  }
}
