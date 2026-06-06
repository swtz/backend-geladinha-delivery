import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { ResponseCustomerDto } from './dto/response-customer.dto';
import { ParseBrPhonePipe } from 'src/user/pipes/format-br-phone.pipe';

@Roles(Role.Admin, Role.Operator)
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  async findAll() {
    const customers = await this.customerService.findAll();
    const parsedCustomers = customers.map(
      customer => new ResponseCustomerDto(customer),
    );
    return parsedCustomers;
  }

  @Get('find')
  async findOne(
    @Query('name') name: string,
    @Query('phone', ParseBrPhonePipe) phone: string,
    @Query('id', new ParseUUIDPipe({ optional: true })) id: string,
  ) {
    const qo =
      !name && !phone && !id ? { name: 'unknown' } : { name, phone, id };
    const customer = await this.customerService.findOneByOrFail(qo);
    return new ResponseCustomerDto(customer);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const customer = await this.customerService.remove(id);
    return new ResponseCustomerDto(customer);
  }
}
