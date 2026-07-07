import { ResponseCustomerDto } from '../dto/response-customer.dto';

export type ResponseCustomer = Omit<ResponseCustomerDto, 'addresses'>;

export type SmallResponseCustomer = Pick<
  ResponseCustomerDto,
  'id' | 'name' | 'lastName' | 'nickname' | 'phone'
>;
