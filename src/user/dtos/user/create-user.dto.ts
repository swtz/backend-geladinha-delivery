import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Role } from 'src/common/role/roles.enum';
import { CreateWorkTimeDto } from 'src/work-time/dto/create-work-time.dto';
import { CreateDeliveryManDto } from '../delivery-man/create-delivery-man.dto';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo nome não pode estar vazio' })
  name!: string;

  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo sobrenome não pode estar vazio' })
  lastName!: string;

  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo apelido não pode estar vazio' })
  nickname!: string;

  @IsPhoneNumber('BR', { message: 'Número de telefone inválido' })
  phone!: string;

  @IsOptional()
  @IsPhoneNumber('BR', { message: 'Número de telefone inválido' })
  secondPhone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'E-mail inválido' })
  email?: string;

  @IsEnum(Role, { message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo função não pode estar vazio' })
  role!: Role;

  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo senha não pode estar vazio' })
  @MinLength(6, { message: 'A senha precisa ter no mínimo 6 caracteres' })
  password!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateDeliveryManDto)
  deliveryMan?: CreateDeliveryManDto;

  @IsOptional()
  @IsNotEmptyObject({ nullable: false }, { message: 'Formato inválido' })
  workTime?: CreateWorkTimeDto;
}
