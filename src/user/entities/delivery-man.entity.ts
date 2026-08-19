import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Motorcycle } from './motorcycle.entity';
import { Tip } from 'src/tip/entities/tip.entity';
import { User } from './user.entity';

@Entity({ orderBy: { createdAt: 'DESC' } })
export class DeliveryMan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('float')
  daily!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToOne(() => Motorcycle, motorcycle => motorcycle.driver, {
    nullable: true,
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn()
  motorcycle!: Motorcycle | null;

  @OneToOne(() => User, user => user.deliveryMan, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  user!: User;

  @OneToMany(() => Tip, tip => tip.motoboy, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
  })
  tips!: Tip[] | null;
}
