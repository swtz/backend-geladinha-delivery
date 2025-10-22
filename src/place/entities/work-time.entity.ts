import { Shift, shifts } from 'src/common/enums/work-shifts.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
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
}
