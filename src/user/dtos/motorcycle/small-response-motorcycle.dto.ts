import { Motorcycle } from 'src/user/entities/motorcycle.entity';

export class SmallResponseMotorcycleDto {
  readonly id: string;
  readonly licensePlate: string;
  readonly brand: string;
  readonly color: string;
  readonly displacement: string | null;
  readonly placeCode: string | null;

  constructor(motorcycle: Motorcycle) {
    this.id = motorcycle.id;
    this.licensePlate = motorcycle.licensePlate;
    this.brand = motorcycle.brand;
    this.color = motorcycle.color;
    this.displacement = motorcycle.displacement;
    this.placeCode = motorcycle.placeCode;
  }
}
