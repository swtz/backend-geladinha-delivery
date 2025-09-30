import { DeliveryMan } from 'src/user/entities/user.entity';
import { Voucher } from 'src/voucher/entities/voucher.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Payout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('double')
  totalDeliveries: number;

  @Column('double')
  motoboyDaily: number;

  @Column('double', { nullable: true })
  motoboyTips: number;

  @Column('double')
  subtotal: number;

  @Column('double')
  totalSpending: number;

  @Column('double')
  total: number;

  @Column({ default: false })
  isClosed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  weekDay: string;

  @Column('datetime', { unique: true, nullable: true })
  workDay: Date;

  @ManyToOne(() => DeliveryMan, { onDelete: 'CASCADE' })
  motoboy: DeliveryMan;

  @OneToMany(() => Voucher, voucher => voucher.payout, { nullable: true })
  vouchers: Voucher[];
}
