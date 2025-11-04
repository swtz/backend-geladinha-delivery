import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  paymentMethods,
  PaymentMethod as PaymentMethodEnum,
} from '../enums/payment-methods.enum';
import { Delivery } from './delivery.entity';

@Entity()
export class PaymentMethod {
  @Column({ default: () => 'gen_random_uuid()', primary: true })
  id: string;

  @Column({ enum: paymentMethods, unique: true })
  name: PaymentMethodEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Delivery, delivery => delivery.paymentMethod)
  deliveries: Delivery[];
}
