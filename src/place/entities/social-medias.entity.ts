import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class SocialMedias {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  instagram!: string;

  @Column({ nullable: true })
  facebook!: string;

  @Column({ nullable: true })
  whatsapp!: string;

  @Column({ nullable: true })
  linkedIn!: string;
}
