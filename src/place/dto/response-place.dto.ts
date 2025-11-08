import { ResponseAddressDto } from 'src/address/dto/response-address.dto';
import { User } from 'src/user/entities/user.entity';
import { Place } from '../entities/place.entity';
import { ResponseWorkTimeDto } from 'src/work-time/dto/response-work-time.dto';

export class ResponsePlaceDto {
  readonly id: string;
  readonly code: string | null;
  readonly name: string;
  readonly businessName: string;
  readonly cnpj: string;
  readonly cpf: string;
  readonly phone: string;
  readonly secondPhone: string | null;
  readonly email: string;
  readonly owners: Pick<User, 'id' | 'phone' | 'email'>[] | null;
  readonly address: ResponseAddressDto | null;
  readonly postalBox: ResponseAddressDto | null;
  readonly workTimes: ResponseWorkTimeDto[] | null;
  // readonly socialMedias: ResponseSocialMediasDto | null;

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
    this.owners = place.owners
      ? place.owners.map(item => {
          return {
            id: item.id,
            phone: item.phone,
            email: item.email,
          };
        })
      : null;
    this.address = place.address ? new ResponseAddressDto(place.address) : null;
    this.postalBox = place.postalBox
      ? new ResponseAddressDto(place.postalBox)
      : null;
    this.workTimes = place.workTimes
      ? place.workTimes.map(item => new ResponseWorkTimeDto(item))
      : null;
  }
}
