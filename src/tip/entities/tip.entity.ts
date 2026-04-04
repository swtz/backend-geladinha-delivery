import { DeliveryMan } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Tip {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('float')
  amount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => DeliveryMan, deliveryMan => deliveryMan.tips, {
    onDelete: 'CASCADE',
  })
  motoboy!: DeliveryMan;
}
