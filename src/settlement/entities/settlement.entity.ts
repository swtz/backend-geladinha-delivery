import { WeekDay, weekDays } from 'src/common/enums/weekDays.enum';
import { User } from 'src/user/entities/user.entity';
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
export class Settlement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('float')
  initValue: number;

  @Column('int')
  amountDeliveries: number;

  @Column('float')
  totalRemainingMotoboy: number;

  @Column('float')
  moneySubtotal: number;

  @Column('float')
  cardSubtotal: number;

  @Column('float')
  pixSubtotal: number;

  @Column('float')
  subtotal: number;

  @Column({ nullable: true })
  description: string;

  @Column('float')
  totalSpending: number;

  @Column('float')
  currentTotal: number;

  @Column('float')
  expectedTotal: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ enum: weekDays })
  weekDay: WeekDay;

  @Column()
  workDay: Date;

  @Column({ default: false })
  isClosed: boolean;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  operator: User;

  @OneToMany(() => Voucher, voucher => voucher.settlement, { nullable: true })
  vouchers: Voucher[];
}
