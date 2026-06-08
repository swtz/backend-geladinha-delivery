import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { ResponseAddressDto } from './dto/response-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { validateFindOneParamsOrFail } from 'src/common/utils/validate-find-one-params-or-fail';
import { Address } from './entities/address.entity';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get('find/:id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const address = await this.addressService.findOneByOrFail({ id });
    return new ResponseAddressDto(address);
  }

  @Get(':id')
  async findAllOwned(@Param('id', ParseUUIDPipe) id: string) {
    const addresses = await this.addressService.findAllOwned({ id });
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
}
