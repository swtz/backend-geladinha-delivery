import { Address } from 'src/address/entities/address.entity';
import {
  Column,
  CreateDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class Place {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  name: string;

  @Column()
  businessName: string;

  @Column()
  cnpj: string;

  @Column()
  phone: string;

  @Column()
  secondPhone: string;

  @Column()
  email: string;

  @ManyToOne(() => Address, { onDelete: 'SET NULL' })
  address: Address;

  @ManyToOne(() => Address, { onDelete: 'SET NULL' })
  postalBox: Address;
  // workTime: WorkTime (init, end, isDefault)
  // socialMedias: SocialMedias (instagram, facebook, linkedIn, etc)
}
