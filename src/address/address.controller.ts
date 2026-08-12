import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { ResponseAddressDto } from './dto/response-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { validateFindOneParamsOrFail } from 'src/common/utils/validate-find-one-params-or-fail';
import { Address } from './entities/address.entity';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { ParseEmailPipe } from 'src/user/pipes/format-email.pipe';
import { ParseBrPhonePipe } from 'src/user/pipes/format-br-phone.pipe';
import { FindOptionsOrder, FindOptionsOrderValue } from 'typeorm';
import { addressOrderMap } from 'src/common/data/entity-instructions/ordering';
import {
  CommonType,
  ParseOrderParamsPipe,
} from 'src/delivery/pipes/parse-order-params.pipe';

@Roles(Role.Admin, Role.Operator)
@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const address = await this.addressService.findOneByOrFail({ id });
    return new ResponseAddressDto(address);
  }

  @Get()
  async findAll(
    @Query('isDefault', new ParseBoolPipe({ optional: true }))
    isDefault: boolean,
    @Query('city') city: string,
    @Query('postalCode') postalCode: string, // formatar
    @Query('neighborhood') neighborhood: string,
    @Query('number') number: string,
    @Query('stateCode') stateCode: string,
    @Query('street') street: string,
    @Query('nickname') nickname: string,
    @Query('id', new ParseUUIDPipe({ optional: true })) id: string,
    @Query('name') name: string,
    @Query('lastName') lastName: string,
    @Query('email', ParseEmailPipe) email: string,
    @Query('phone', ParseBrPhonePipe) phone: string,
    @Query('secondPhone', ParseBrPhonePipe) secondPhone: string,
    @Query(new ParseOrderParamsPipe<CommonType<Address>>(addressOrderMap))
    orderParams: {
      [K in keyof FindOptionsOrder<Address>]: FindOptionsOrderValue;
    },
  ) {
    const customerData = {
      id,
      nickname,
      name,
      lastName,
      email,
      phone,
      secondPhone,
    };
    const addresses = await this.addressService.findAll({
      customerData,
      city,
      postalCode,
      neighborhood,
      street,
      number,
      stateCode,
      isDefault,
      orderParams,
    });
    const parsedAddresses = addresses.map(
      address => new ResponseAddressDto(address),
    );
    return parsedAddresses;
  }

  @Patch(':id')
  async update(
    @Body() dto: UpdateAddressDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const parsedDto = validateFindOneParamsOrFail<Partial<Address>>(dto);
    const address = await this.addressService.update(parsedDto, id);
    return new ResponseAddressDto(address);
  }

  @Roles(Role.Admin)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const address = await this.addressService.remove(id);
    return new ResponseAddressDto(address);
  }
}
