import { Type } from 'class-transformer';
import {
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { UserUniqueFieldsDto } from 'src/user/dtos/user/user-unique-fields.dto';

export class CreateSettlementDto {
  @ValidateNested()
  @Type(() => UserUniqueFieldsDto)
  user!: UserUniqueFieldsDto;

  @IsNotEmpty({ message: 'Campo data inicial não pode estar vazio' })
  @IsISO8601({ strict: true }, { message: 'Data inválido' })
  from!: string;

  @IsNotEmpty({ message: 'Campo data final não pode estar vazio' })
  @IsISO8601({ strict: true }, { message: 'Data inválido' })
  to!: string;

  @IsNotEmpty({ message: 'Campo estabelecimento não pode estar vazio' })
  @IsString({ message: 'Formato inválido' })
  placeCode!: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Número inválido' })
  initValue!: number;

  @IsOptional()
  @IsString({ message: 'Formato inválido' })
  @MaxLength(130, {
    message: 'A descrição só pode ter no máximo 130 caracteres',
  })
  description?: string;
}
