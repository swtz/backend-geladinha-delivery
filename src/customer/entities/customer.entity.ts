import { Address } from 'src/address/entities/address.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  lastName!: string;

  @Column({ nullable: true })
  nickname!: string;

  @Column({ unique: true })
  phone!: string;

  @Column({ nullable: true, unique: true })
  secondPhone!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updateAt!: Date;

  @OneToMany(() => Address, address => address.customer, {
    onDelete: 'SET NULL',
  })
  addresses!: Address[];
}
