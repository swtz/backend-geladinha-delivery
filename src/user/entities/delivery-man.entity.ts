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

@Entity()
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
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  motorcycle!: Motorcycle;

  @OneToOne(() => User, user => user.deliveryMan, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user!: User;

  @OneToMany(() => Tip, tip => tip.motoboy, { nullable: true })
  tips!: Tip[];
}
