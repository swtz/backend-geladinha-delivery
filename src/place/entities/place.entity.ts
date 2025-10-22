import { Address } from 'src/address/entities/address.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WorkTime } from './work-time.entity';

@Entity()
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

  @ManyToMany(() => WorkTime, workTime => workTime.places)
  @JoinTable()
  workTimes: WorkTime[];
  // socialMedias: SocialMedias (instagram, facebook, linkedIn, etc)
}
