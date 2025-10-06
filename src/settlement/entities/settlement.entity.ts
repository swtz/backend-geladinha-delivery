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

  @Column('int')
  amountDeliveries: number;

  @Column('double')
  totalRemainingMotoboy: number;

  @Column('double')
  moneySubtotal: number;

  @Column('double')
  cardSubtotal: number;

  @Column('double')
  pixSubtotal: number;

  @Column('double')
  subtotal: number;

  @Column({ nullable: true })
  description: string;

  @Column('double')
  totalSpending: number;

  @Column('double')
  total: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  operator: User;

  @OneToMany(() => Voucher, voucher => voucher.settlement, { nullable: true })
  vouchers: Voucher[];
}
