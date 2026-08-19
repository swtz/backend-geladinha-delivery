import { Motorcycle } from 'src/user/entities/motorcycle.entity';
import { SmallResponseUserDto } from '../user/small-response-user.dto';

export class ResponseMotorcycleDto {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly licensePlate: string;
  readonly brand: string;
  readonly year: string;
  readonly model: string;
  readonly displacement: string | null;
  readonly color: string;
  readonly isActive: boolean;
  readonly placeCode: string | null;
  readonly owner: SmallResponseUserDto | null;
  readonly driver: SmallResponseUserDto | null;

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
    this.placeCode = motorcycle.placeCode;
    this.owner = motorcycle.owner
      ? new SmallResponseUserDto(motorcycle.owner)
      : null;
    this.driver = motorcycle.driver?.user
      ? new SmallResponseUserDto(motorcycle.driver?.user)
      : null;
  }
}
