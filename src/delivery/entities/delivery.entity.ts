import { Address } from 'src/address/entities/address.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { DeliveryMan, User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentMethod } from './payment-method.entity';

@Entity()
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150, nullable: true })
  description: string;

  @Column({ type: 'double' })
  totalPurchase: number;

  @Column({ type: 'double' })
  deliveryTax: number;

  @Column({ default: false })
  paid: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => PaymentMethod, paymentMethod => paymentMethod.deliveries, {
    onDelete: 'SET NULL',
  })
  paymentMethod: PaymentMethod;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  operator: User;

  @ManyToOne(() => DeliveryMan, { onDelete: 'SET NULL' })
  motoboy: DeliveryMan;

  @ManyToOne(() => Customer, { onDelete: 'SET NULL' })
  customer: Customer;

  @ManyToOne(() => Address, { onDelete: 'SET NULL' })
  address: Address;
}
