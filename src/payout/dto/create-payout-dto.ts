import { Type } from 'class-transformer';
import {
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateUserPayoutDto } from 'src/user/dtos/user/create-user-payout.dto';

export class CreatePayoutDto {
  @ValidateNested()
  @Type(() => CreateUserPayoutDto)
  user!: CreateUserPayoutDto;

  @IsNotEmpty({ message: 'Campo data inicial não pode estar vazio' })
  @IsISO8601({ strict: true }, { message: 'Data inválido' })
  from!: string;

  @IsNotEmpty({ message: 'Campo data final não pode estar vazio' })
  @IsISO8601({ strict: true }, { message: 'Data inválido' })
  to!: string;

  @IsNotEmpty({ message: 'Campo estabelecimento não pode estar vazio' })
  @IsString({ message: 'Formato inválido' })
  placeCode!: string;
}
