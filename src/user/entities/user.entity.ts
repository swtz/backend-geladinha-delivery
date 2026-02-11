import { Role } from 'src/common/role/entities/role.entity';
import { Tip } from 'src/tip/entities/tip.entity';
import { Voucher } from 'src/voucher/entities/voucher.entity';
import { WorkTime } from 'src/work-time/entities/work-time.entity';
import {
  ChildEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  TableInheritance,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // REMOVER {nullable: true}
  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  nickname: string;

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true })
  secondPhone: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  forceLogout: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Voucher, voucher => voucher.user, {
    nullable: true,
  })
  vouchers: Voucher[];

  @ManyToMany(() => Role, role => role.users)
  @JoinTable()
  roles: Role[];

  @OneToOne(() => WorkTime, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  workTime: WorkTime;
}

@ChildEntity()
export class DeliveryMan extends User {
  @Column()
  motorcycle: string;

  @OneToMany(() => Tip, tip => tip.motoboy, { nullable: true })
  tips: Tip[];

  @Column('float')
  daily: number;
}
