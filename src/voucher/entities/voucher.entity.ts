import { DeliveryManEntity } from 'src/delivery-man/entities/delivery-man.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class VoucherEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('double')
  amount: number;

  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => DeliveryManEntity)
  deliveryMan: DeliveryManEntity;
}
