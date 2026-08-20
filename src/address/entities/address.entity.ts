import { Customer } from 'src/customer/entities/customer.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ orderBy: { createdAt: 'DESC' } })
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 48 })
  street!: string;

  @Column({ length: 16, default: 'S/N' })
  number!: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  complement!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  referencePoint!: string | null;

  @Column({ length: 32 })
  neighborhood!: string;

  @Column({ length: 32, default: '88955-000' })
  postalCode!: string;

  @Column({ length: 32, default: 'BALNEARIO_GAIVOTA' })
  city!: string;

  @Column({ length: 2, default: 'SC' })
  stateCode!: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  location!: string | null;

  @Column({ default: false })
  isDefault!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Customer, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  customer!: Customer | null;
}
