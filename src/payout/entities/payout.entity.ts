import { WeekDay, weekDays } from 'src/common/enums/weekDays.enum';
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
  @Column({ default: () => 'gen_random_uuid()', primary: true })
  id: string;

  @Column('float')
  totalDeliveries: number;

  @Column('float')
  motoboyDaily: number;

  @Column('float')
  motoboyTips: number;

  @Column('float')
  subtotal: number;

  @Column('float')
  totalSpending: number;

  @Column('float')
  total: number;

  @Column({ default: false })
  isClosed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ enum: weekDays })
  weekDay: WeekDay;

  @Column()
  workDay: Date;

  @ManyToOne(() => DeliveryMan, { onDelete: 'CASCADE' })
  motoboy: DeliveryMan;

  @OneToMany(() => Voucher, voucher => voucher.payout, { nullable: true })
  vouchers: Voucher[];
}
