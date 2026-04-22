import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DeliveryMan, User } from './user.entity';

@Entity()
export class Motorcycle {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  licensePlate!: string;

  @Column()
  brand!: string;

  @Column()
  year!: string;

  @Column()
  model!: string;

  @Column({ nullable: true })
  displacement!: string;

  @Column()
  color!: string;

  @Column({ default: false })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  owner!: User;

  @OneToOne(() => DeliveryMan, deliveryMan => deliveryMan.motorcycle_new, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  driver!: DeliveryMan;
}
