import { Shift, shifts } from 'src/common/enums/work-shifts.enum';
import { Place } from 'src/place/entities/place.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @Column({ default: false })
  isShared: boolean;

  @ManyToMany(() => Place, place => place.workTimes, { onDelete: 'CASCADE' })
  places: Place[];
}
