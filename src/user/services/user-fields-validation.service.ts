import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dtos/user/create-user.dto';
import { UserValidators } from '../types/user/user-validator.type';
import { UserService } from '../user.service';
import { UpdateUserDto } from '../dtos/user/update-user.dto';

@Injectable()
export class UserFieldsValidationService {
  constructor(private readonly userService: UserService) {}

  async validateUniqueFields(dto: CreateUserDto | UpdateUserDto) {
    const uniqueFieldsValidationObject: UserValidators = {
      nickname: async (nickname: string) =>
        await this.userService.failIfNicknameExists(nickname),
      email: async (email: string) =>
        await this.userService.failIfEmailExists(email),
      phone: async (phone: string) =>
        await this.userService.failIfPhoneExists(phone),
      secondPhone: async (secondPhone: string) =>
        await this.userService.failIfPhoneExists(secondPhone, true),
    } satisfies UserValidators;

    for (const field of Object.keys(
      uniqueFieldsValidationObject,
    ) as (keyof UserValidators)[]) {
      const value = dto[field];

      if (value === undefined) continue;

      await uniqueFieldsValidationObject[field](value);
    }
  }
}
