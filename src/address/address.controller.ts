import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { AddressService } from './address.service';
import { ResponseAddressDto } from './dto/response-address.dto';

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
}
