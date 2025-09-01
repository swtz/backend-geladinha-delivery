import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Roles(Role.Admin, Role.Operator)
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateCustomerDto) {
    const customer = await this.customerService.create(dto);
    return customer;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Body() dto: UpdateCustomerDto,
    // @Body('address') address: UpdateAddressDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const customer = await this.customerService.update(dto, id);
    return customer;
  }
}
