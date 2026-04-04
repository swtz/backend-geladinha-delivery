import { Payout } from 'src/payout/entities/payout.entity';
import { Settlement } from 'src/settlement/entities/settlement.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Voucher {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('float')
  amount!: number;

  @Column({ nullable: true })
  description!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, user => user.vouchers, {
    onDelete: 'CASCADE',
  })
  user!: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  createdBy!: User;

  @ManyToOne(() => Payout, payout => payout.vouchers, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  payout!: Payout;

  @ManyToOne(() => Settlement, settlement => settlement.vouchers, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  settlement!: Settlement;
}
