import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { CustomerValidators } from '../types/customer-validator.type';
import { CustomerService } from '../customer.service';

@Injectable()
export class CustomerFieldsValidationService {
  constructor(private readonly customerService: CustomerService) {}

  async validateUniqueFields(dto: CreateCustomerDto | UpdateCustomerDto) {
    const uniqueFieldsValidationObject: CustomerValidators = {
      nickname: async (nickname: string) =>
        await this.customerService.failIfNicknameExists(nickname),
      // email: async (email: string) =>
      //   await this.customerService.failIfEmailExists(email),
      phone: async (phone: string) =>
        await this.customerService.failIfPhoneExists(phone),
      secondPhone: async (secondPhone: string) =>
        await this.customerService.failIfPhoneExists(secondPhone, true),
    } satisfies CustomerValidators;

    for (const field of Object.keys(
      uniqueFieldsValidationObject,
    ) as (keyof CustomerValidators)[]) {
      const value = dto[field];

      if (value === undefined) continue;

      await uniqueFieldsValidationObject[field](value);
    }
  }
}
