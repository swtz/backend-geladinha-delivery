import { Customer } from 'src/customer/entities/customer.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Address {
  @Column({ default: () => 'gen_random_uuid()', primary: true })
  id: string;

  @Column({ length: 48 })
  street: string;

  @Column({ length: 16, default: 'S/N' })
  number: string;

  @Column({ length: 32, nullable: true })
  complement: string;

  @Column({ length: 32, nullable: true })
  referencePoint: string;

  @Column({ length: 32 })
  neighborhood: string;

  @Column({ length: 32, default: '88955-000' })
  postalCode: string;

  @Column({ length: 32, default: 'Balneário Gaivota' })
  city: string;

  @Column({ length: 2, default: 'SC' })
  stateCode: string;

  @Column({ length: 32, nullable: true })
  location: string;

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  customer: Customer;
}
