import { WeekDay, weekDays } from 'src/common/enums/weekDays.enum';
import { DeliveryMan } from 'src/user/entities/delivery-man.entity';
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
  id!: string;

  @Column('float')
  totalDeliveries!: number;

  @Column()
  quantityDeliveries!: number;

  @Column('float')
  motoboyDaily!: number;

  @Column('float')
  motoboyTips!: number;

  @Column('float')
  subtotal!: number;

  @Column('float')
  totalSpending!: number;

  @Column('float')
  total!: number;

  @Column({ default: false })
  isClosed!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ enum: weekDays })
  weekDay!: WeekDay;

  @Column()
  workDay!: Date;

  @Column()
  motorcycleLicensePlate!: string;

  // Será necessário computar o dia/horário do término do serviço do motoboy,
  // ou User.workTime já é suficiente?
  // @Column()
  // workEndDay!: Date;

  @ManyToOne(() => DeliveryMan, { onDelete: 'CASCADE', nullable: false })
  motoboy!: DeliveryMan;

  @OneToMany(() => Voucher, voucher => voucher.payout, { nullable: true })
  vouchers!: Voucher[];
}
