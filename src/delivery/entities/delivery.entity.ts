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

  @Column({ type: 'varchar', length: 150, nullable: true })
  description!: string | null;

  @Column('float')
  totalPurchase!: number;

  @Column('float')
  deliveryTax!: number;

  @Column({ type: 'float', nullable: true })
  change!: number | null;

  @Column({ default: false })
  isPaid!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column()
  motorcycleLicensePlate!: string;

  @Column()
  placeCode!: string;

  @OneToOne(() => Tip, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
  })
  @JoinColumn()
  tip!: Tip | null;

  @ManyToOne(() => PaymentMethod, paymentMethod => paymentMethod.deliveries, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
  })
  paymentMethod!: PaymentMethod | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
  })
  operator!: User | null;

  @ManyToOne(() => DeliveryMan, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
  })
  motoboy!: DeliveryMan | null;

  @ManyToOne(() => Customer, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
  })
  customer!: Customer | null;

  @ManyToOne(() => Address, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
  })
  address!: Address | null;
}
