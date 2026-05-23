import { ResponseAddressDto } from 'src/address/dto/response-address.dto';
import { Place } from '../entities/place.entity';
import { ResponseWorkTimeDto } from 'src/work-time/dto/response-work-time.dto';
import { UserResponseDtoType } from 'src/user/types/user/user.type';

export class ResponsePlaceDto {
  readonly id: string;
  readonly code?: string;
  readonly name: string;
  readonly businessName: string;
  readonly cnpj: string;
  readonly cpf: string;
  readonly phone: string;
  readonly secondPhone?: string;
  readonly email: string;
  readonly owners?: UserResponseDtoType[];
  readonly address?: ResponseAddressDto;
  readonly postalBox?: ResponseAddressDto;
  readonly workTimes?: ResponseWorkTimeDto[];
  // readonly socialMedias?: ResponseSocialMediasDto;

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
            name: item.name,
            phone: item.phone,
          };
        })
      : undefined;
    this.address = place.address
      ? new ResponseAddressDto(place.address)
      : undefined;
    this.postalBox = place.postalBox
      ? new ResponseAddressDto(place.postalBox)
      : undefined;
    this.workTimes = place.workTimes
      ? place.workTimes.map(item => new ResponseWorkTimeDto(item))
      : undefined;
  }
}
