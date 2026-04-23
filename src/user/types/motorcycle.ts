import { Motorcycle } from '../entities/motorcycle.entity';

export type MotorcycleType = Omit<
  Motorcycle,
  'id' | 'createdAt' | 'updatedAt' | 'displacement'
> & { displacement: string | undefined };
