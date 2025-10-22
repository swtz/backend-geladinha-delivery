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

  @Column({ enum: ['manhã', 'tarde', 'noite', 'madrugada', 'integral'] })
  turn: string;

  @Column()
  initHour: number;

  @Column()
  endHour: number;

  @Column({ default: false })
  isDefault: boolean;
}
