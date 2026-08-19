import { Role } from 'src/common/role/entities/role.entity';
import { Voucher } from 'src/voucher/entities/voucher.entity';
import { WorkTime } from 'src/work-time/entities/work-time.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DeliveryMan } from './delivery-man.entity';
import { IntervalTime } from 'src/work-time/entities/interval-time.entity';

@Entity({ orderBy: { createdAt: 'DESC' } })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  lastName!: string;

  @Column({ unique: true })
  nickname!: string;

  @Column({ unique: true })
  phone!: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  secondPhone!: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true })
  email!: string | null;

  @Column()
  password!: string;

  @Column({ default: false })
  forceLogout!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column()
  placeCode!: string;

  @OneToOne(() => DeliveryMan, deliveryMan => deliveryMan.user, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
  })
  deliveryMan!: DeliveryMan | null;

  @OneToMany(() => Voucher, voucher => voucher.user, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
  })
  vouchers!: Voucher[] | null;

  @ManyToMany(() => Role, role => role.users)
  @JoinTable()
  roles!: Role[];

  @ManyToOne(() => WorkTime, workTime => workTime.users, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
  })
  workTime!: WorkTime | null;

  @OneToOne(() => IntervalTime, intervalTime => intervalTime.user, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
  })
  intervalTime!: IntervalTime | null;
}
