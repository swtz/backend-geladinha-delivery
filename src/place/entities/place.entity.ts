import { Address } from 'src/address/entities/address.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SocialMedias } from './social-medias.entity';
import { User } from 'src/user/entities/user.entity';
import { WorkTime } from 'src/work-time/entities/work-time.entity';

@Entity()
export class Place {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  code: string;

  @Column({ unique: true })
  name: string;

  @Column()
  businessName: string;

  @Column({ unique: true })
  cnpj: string;

  @Column({ unique: true })
  cpf: string;

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true })
  secondPhone: string;

  @Column({ unique: true })
  email: string;

  @ManyToMany(() => User)
  @JoinTable()
  owners: User[];

  @ManyToOne(() => Address, { onDelete: 'SET NULL' })
  address: Address;

  @ManyToOne(() => Address, { onDelete: 'SET NULL' })
  postalBox: Address;

  @ManyToMany(() => WorkTime, workTime => workTime.places, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable()
  workTimes: WorkTime[];

  @OneToOne(() => SocialMedias, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  socialMedias: SocialMedias;
}
