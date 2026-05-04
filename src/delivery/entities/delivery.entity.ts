import { Address } from 'src/address/entities/address.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { User } from 'src/user/entities/user.entity';
import { DeliveryMan } from 'src/user/entities/delivery-man.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentMethod } from './payment-method.entity';
import { Tip } from 'src/tip/entities/tip.entity';

@Entity()
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 150, nullable: true })
  description!: string;

  @Column('float')
  totalPurchase!: number;

  @Column('float')
  deliveryTax!: number;

  @Column({ default: false })
  isPaid!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column()
  motorcycleLicensePlate!: string;

  @OneToOne(() => Tip, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  tip!: Tip;

  @ManyToOne(() => PaymentMethod, paymentMethod => paymentMethod.deliveries, {
    onDelete: 'SET NULL',
  })
  paymentMethod!: PaymentMethod;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  operator!: User;

  @ManyToOne(() => DeliveryMan, { onDelete: 'SET NULL', nullable: true })
  motoboy!: DeliveryMan;

  @ManyToOne(() => Customer, { onDelete: 'SET NULL', nullable: true })
  customer!: Customer;

  @ManyToOne(() => Address, { onDelete: 'SET NULL', nullable: true })
  address!: Address;
}
