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
  id!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true, unique: true })
  code!: string;

  @Column({ unique: true })
  name!: string;

  @Column()
  businessName!: string;

  @Column({ unique: true })
  cnpj!: string;

  @Column({ unique: true })
  cpf!: string;

  @Column({ unique: true })
  phone!: string;

  @Column({ nullable: true })
  secondPhone!: string;

  @Column({ unique: true })
  email!: string;

  @ManyToMany(() => User, { cascade: true, onDelete: 'CASCADE' })
  @JoinTable()
  owners!: User[];

  @ManyToOne(() => Address, { onDelete: 'SET NULL', nullable: true })
  address!: Address;

  @ManyToOne(() => Address, { onDelete: 'SET NULL', nullable: true })
  postalBox!: Address;

  @ManyToMany(() => WorkTime, workTime => workTime.places, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable()
  workTimes!: WorkTime[];

  @OneToOne(() => SocialMedias, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  socialMedias!: SocialMedias;
}
