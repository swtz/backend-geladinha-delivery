import { Shift, shifts } from 'src/common/enums/work-shifts.enum';
import { Place } from 'src/place/entities/place.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IntervalTime } from './interval-time.entity';

@Entity({ orderBy: { createdAt: 'DESC' } })
export class WorkTime {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ enum: shifts })
  shift!: Shift;

  @Column()
  initHour!: string;

  @Column()
  endHour!: string;

  @Column()
  duration!: string;

  @Column({ default: false })
  isDefault!: boolean;

  @Column({ default: false })
  isShared!: boolean;

  @ManyToMany(() => Place, place => place.workTimes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  places!: Place[];

  @OneToMany(() => IntervalTime, intervalTime => intervalTime.workTime, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
  })
  intervalTimes!: IntervalTime[] | null;

  @OneToMany(() => User, user => user.workTime, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
  })
  users!: User[] | null;
}
