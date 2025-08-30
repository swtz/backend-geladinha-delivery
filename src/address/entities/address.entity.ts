import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 48 })
  street: string;

  @Column({ length: 16 })
  number: string;

  @Column({ length: 32 })
  complement: string;

  @Column({ length: 32 })
  referencePoint: string;

  @Column({ length: 32 })
  neighborhood: string;

  @Column({ length: 32, default: '88955-000' })
  postalCode: string;

  @Column({ length: 32, default: 'Balneário Gaivota' })
  city: string;

  @Column({ length: 2, default: 'SC' })
  stateCode: string;

  @Column({ length: 32 })
  location: string;
}
