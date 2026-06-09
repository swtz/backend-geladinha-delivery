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
}
