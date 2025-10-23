import { Shift, shifts } from 'src/common/enums/work-shifts.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Place } from './place.entity';

@Entity()
export class WorkTime {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ enum: shifts })
  shift: Shift;

  @Column()
  initHour: number;

  @Column()
  endHour: number;

  @Column({ default: false })
  isDefault: boolean;

  @ManyToMany(() => Place, place => place.workTimes)
  places: Place[];
}
