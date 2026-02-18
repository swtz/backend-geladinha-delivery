import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DeliveryMan, User } from './user.entity';

@Entity()
export class Motorcycle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  licensePlate: string;

  @Column()
  brand: string;

  @Column()
  year: string;

  @Column()
  model: string;

  @Column()
  color: string;

  @Column({ default: false })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  owner: User;

  @ManyToOne(() => DeliveryMan, { onDelete: 'SET NULL' })
  driver: DeliveryMan;
}
