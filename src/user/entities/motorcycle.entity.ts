import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { DeliveryMan } from './delivery-man.entity';

@Entity()
export class Motorcycle {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  licensePlate!: string;

  @Column()
  brand!: string;

  @Column()
  year!: string;

  @Column()
  model!: string;

  @Column({ type: 'varchar', nullable: true })
  displacement!: string | null;

  @Column()
  color!: string;

  @Column({ default: false })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  placeCode!: string | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
  })
  owner!: User;

  @OneToOne(() => DeliveryMan, deliveryMan => deliveryMan.motorcycle, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  driver!: DeliveryMan;
}
