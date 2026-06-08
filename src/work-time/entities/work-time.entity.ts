import { Shift, shifts } from 'src/common/enums/work-shifts.enum';
import { Place } from 'src/place/entities/place.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
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
  initHour!: Date;

  @Column()
  endHour!: Date;

  @Column()
  duration!: Date;

  @Column({ default: false })
  isDefault!: boolean;

  @Column({ default: false })
  isShared!: boolean;

  @ManyToMany(() => Place, place => place.workTimes, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  places!: Place[];

  @OneToMany(() => User, user => user.workTime, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  user!: User[];
}
