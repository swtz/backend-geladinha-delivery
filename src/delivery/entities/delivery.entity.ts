import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class DeliveryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column({ type: 'double' })
  totalPurchase: number;
  @Column({ type: 'double' })
  deliveryTax: number;
  @Column()
  paymentMethod: string;
  @Column({ default: false })
  paid: boolean;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
