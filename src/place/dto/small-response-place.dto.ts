import { Place } from '../entities/place.entity';

export class SmallResponsePlaceDto {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly businessName: string;
  readonly phone: string;
  readonly cnpj: string;
  readonly cpf: string | null;

  constructor(place: Place) {
    this.id = place.id;
    this.code = place.code;
    this.name = place.name;
    this.businessName = place.businessName;
    this.phone = place.phone;
    this.cnpj = place.cnpj;
    this.cpf = place.cpf;
  }
}
