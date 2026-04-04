import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo senha atual não pode estar vazio' })
  currentPassword!: string;

  @IsString({ message: 'Formato inválido' })
  @IsNotEmpty({ message: 'Campo nova senha não pode estar vazio' })
  @MinLength(6, { message: 'A nova senha precisa ter no mínimo 6 caracteres' })
  newPassword!: string;
}
