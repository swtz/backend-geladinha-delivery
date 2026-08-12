import { Injectable } from '@nestjs/common';
import { CreatePlaceDto } from '../dto/create-place.dto';
import { CreatePlaceDtoForValidator } from '../types/place-validator.type';
import { PlaceService } from '../services/place.service';
import { UpdatePlaceDto } from '../dto/update-place.dto';
import { Place } from '../entities/place.entity';

@Injectable()
export class PlaceFieldsValidationService {
  constructor(private readonly placeService: PlaceService) {}

  async validateUniqueFields(dto: CreatePlaceDto | UpdatePlaceDto) {
    const validator: Partial<Place> = {
      name: dto.name,
      businessName: dto.businessName,
      code: dto.code,
      cnpj: dto.cnpj,
      cpf: dto.cpf,
      email: dto.email,
      phone: dto.phone,
      secondPhone: dto.secondPhone,
    };
    const uniqueFieldsValidationObject = {
      init: async (field: string, value: string) => {
        await this.placeService.failIfExists(field, value);
      },
    };
    for (const field of Object.keys(
      validator,
    ) as (keyof CreatePlaceDtoForValidator)[]) {
      const value = dto[field];

      if (value === undefined) continue;

      await uniqueFieldsValidationObject.init(field, value);
    }
  }
}
