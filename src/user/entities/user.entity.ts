import { Role } from 'src/common/role/entities/role.entity';
import { Voucher } from 'src/voucher/entities/voucher.entity';
import { WorkTime } from 'src/work-time/entities/work-time.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DeliveryMan } from './delivery-man.entity';

@Entity()
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

  @Column({ nullable: true, unique: true })
  secondPhone!: string;

  @Column({ unique: true, nullable: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ default: false })
  forceLogout!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToOne(() => DeliveryMan, deliveryMan => deliveryMan.user, {
    nullable: true,
  })
  deliveryMan!: DeliveryMan;

  @OneToMany(() => Voucher, voucher => voucher.user, {
    nullable: true,
  })
  vouchers!: Voucher[];

  @ManyToMany(() => Role, role => role.users)
  @JoinTable()
  roles!: Role[];

  @OneToOne(() => WorkTime, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  workTime!: WorkTime;
}
