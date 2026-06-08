import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WorkTime } from './work-time.entity';

@Entity()
export class IntervalTime {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column()
  initHour!: Date;

  @Column()
  endHour!: Date;

  @Column()
  duration!: Date;

  @ManyToOne(() => WorkTime)
  workTime!: WorkTime;
}
