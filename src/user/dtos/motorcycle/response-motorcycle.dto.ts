import { Motorcycle } from 'src/user/entities/motorcycle.entity';
import { UserResponseDtoType } from 'src/user/types/user/user.type';

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
  readonly isActive: boolean;
  readonly owner?: UserResponseDtoType;
  readonly driver?: UserResponseDtoType;

  constructor(motorcycle: Motorcycle) {
    this.id = motorcycle.id;
    this.createdAt = motorcycle.createdAt;
    this.updatedAt = motorcycle.updatedAt;
    this.licensePlate = motorcycle.licensePlate;
    this.brand = motorcycle.brand;
    this.year = motorcycle.year;
    this.model = motorcycle.model;
    this.displacement = motorcycle.displacement;
    this.color = motorcycle.color;
    this.isActive = motorcycle.isActive;
    this.owner = motorcycle.owner
      ? {
          id: motorcycle.owner.id,
          name: motorcycle.owner.name,
          phone: motorcycle.owner.phone,
        }
      : undefined;
    this.driver = motorcycle.driver.user
      ? {
          id: motorcycle.driver.user.id,
          name: motorcycle.driver.user.name,
          phone: motorcycle.driver.user.phone,
        }
      : undefined;
  }
}
