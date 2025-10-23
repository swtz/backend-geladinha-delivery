import { Place } from '../entities/place.entity';

export type PlaceType = Omit<
  Place,
  'id' | 'createdAt' | 'updatedAt' | 'socialMedias'
>;
