import { Controller, Get, Param } from '@nestjs/common';
import { AddressService } from './address.service';
import { ResponseAddressDto } from './dto/response-address.dto';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get(':id')
  async findAllOwned(@Param('id') id: string) {
    const addresses = await this.addressService.findAllOwned({ id });
    const parsedAddresses = addresses.map(
      address => new ResponseAddressDto(address),
    );
    return parsedAddresses;
  }
}
