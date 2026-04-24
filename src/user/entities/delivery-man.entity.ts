import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Motorcycle } from './motorcycle.entity';
import { Tip } from 'src/tip/entities/tip.entity';
import { User } from './user.entity';

@Entity()
export class DeliveryMan {
  @Column('float')
  daily!: number;

  @OneToOne(() => Motorcycle, motorcycle => motorcycle.driver, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  motorcycle!: Motorcycle;

  @OneToOne(() => User, user => user.deliveryMan, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user!: User;

  @OneToMany(() => Tip, tip => tip.motoboy, { nullable: true })
  tips!: Tip[];
}
