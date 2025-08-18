import { DeliveryManEntity } from 'src/delivery-man/entities/delivery-man.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class DeliveryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'double' })
  totalPurchase: number;

  @Column({ type: 'double' })
  deliveryTax: number;

  @Column()
  paymentMethod: string;

  @Column({ default: false })
  paid: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  operator: UserEntity;

  @ManyToOne(() => DeliveryManEntity, { onDelete: 'SET NULL' })
  motoboy: DeliveryManEntity;
}
