import { Address } from '../entities/address.entity';

export class ResponseAddressDto {
  readonly id: string;
  readonly street: string;
  readonly number: string;
  readonly complement: string | null;
  readonly referencePoint: string | null;
  readonly neighborhood: string;
  readonly postalCode: string;
  readonly city: string;
  readonly stateCode: string;
  readonly location: string | null;
  readonly isDefault: boolean;
  readonly customer: {
    id: string;
    name: string;
    phone: string;
  };

  constructor(address: Address) {
    this.id = address.id;
    this.street = address.street;
    this.number = address.number;
    this.complement = address.complement;
    this.referencePoint = address.referencePoint;
    this.neighborhood = address.neighborhood;
    this.postalCode = address.postalCode;
    this.city = address.city;
    this.stateCode = address.stateCode;
    this.location = address.location;
    this.isDefault = address.isDefault;
    this.customer = {
      id: address.customer.id,
      name: address.customer.name,
      phone: address.customer.phone,
    };
  }
}
