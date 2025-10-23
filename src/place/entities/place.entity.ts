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
import { WorkTime } from './work-time.entity';
import { SocialMedias } from './social-medias.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class Place {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  name: string;

  @Column()
  businessName: string;

  @Column()
  cnpj: string;

  @Column()
  cpf: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  secondPhone: string;

  @Column()
  email: string;

  @ManyToMany(() => User)
  @JoinTable()
  owners: User[];

  @ManyToOne(() => Address, { onDelete: 'SET NULL' })
  address: Address;

  @ManyToOne(() => Address, { onDelete: 'SET NULL' })
  postalBox: Address;

  @ManyToMany(() => WorkTime, workTime => workTime.places)
  @JoinTable()
  workTimes: WorkTime[];

  @OneToOne(() => SocialMedias, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  socialMedias: SocialMedias;
}
