import { UserDtoType } from 'src/user/types/user';

export class ResponseMotorcycleDto {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly licensePlate: string;
  readonly brand: string;
  readonly year: string;
  readonly model: string;
  readonly displacement?: string;
  readonly color: string;
  readonly isActive: string;
  readonly owner: UserDtoType;
  readonly driver: UserDtoType;
}
