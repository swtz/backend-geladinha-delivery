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
import { WorkTime } from './work-time.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class IntervalTime {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column()
  initHour!: string;

  @Column()
  endHour!: string;

  @Column({ default: '' })
  duration!: string;

  @ManyToOne(() => WorkTime, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: false,
  })
  workTime!: WorkTime;

  @OneToOne(() => User, user => user.intervalTime, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  user!: User;
}
