import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

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
}
