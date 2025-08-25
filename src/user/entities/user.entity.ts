import { Role } from 'src/common/role/entities/role.entity';
import { Voucher } from 'src/voucher/entities/voucher.entity';
import {
  ChildEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
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

  @Column({ unique: true })
  phone: string;

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
}

@ChildEntity()
export class DeliveryMan extends User {
  @Column()
  motorcycle: string;

  @Column('double', { nullable: true })
  tip: number;

  @Column('double')
  daily: number;
}
