import { ResponseAddressDto } from 'src/address/dto/response-address.dto';
import { Place } from '../entities/place.entity';
import { ResponseWorkTimeDto } from 'src/work-time/dto/work-time/response-work-time.dto';
import { SmallResponseUserDto } from 'src/user/dtos/user/small-response-user.dto';

export class ResponsePlaceDto {
  readonly id: string;
  readonly code: string | null;
  readonly name: string;
  readonly businessName: string;
  readonly cnpj: string;
  readonly cpf: string | null;
  readonly phone: string;
  readonly secondPhone: string | null;
  readonly email: string;
  readonly owners: SmallResponseUserDto[] | null;
  readonly address: ResponseAddressDto | null;
  readonly postalBox: ResponseAddressDto | null;
  readonly workTimes: ResponseWorkTimeDto[] | null;

  constructor(place: Place) {
    this.id = place.id;
    this.code = place.code;
    this.name = place.name;
    this.businessName = place.businessName;
    this.cnpj = place.cnpj;
    this.cpf = place.cpf;
    this.phone = place.phone;
    this.secondPhone = place.secondPhone;
    this.email = place.email;
    this.owners =
      place.owners.length > 0
        ? place.owners.map(user => {
            return new SmallResponseUserDto(user);
          })
        : null;
    this.address = place.address ? new ResponseAddressDto(place.address) : null;
    this.postalBox = place.postalBox
      ? new ResponseAddressDto(place.postalBox)
      : null;
    this.workTimes =
      place.workTimes.length > 0
        ? place.workTimes.map(workTime => new ResponseWorkTimeDto(workTime))
        : null;
  }
}
