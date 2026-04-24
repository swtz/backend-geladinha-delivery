import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Motorcycle } from './motorcycle.entity';
import { Tip } from 'src/tip/entities/tip.entity';

@Entity()
export class DeliveryMan {
  @OneToOne(() => Motorcycle, motorcycle => motorcycle.driver, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  motorcycle!: Motorcycle;

  @OneToMany(() => Tip, tip => tip.motoboy, { nullable: true })
  tips!: Tip[];

  @Column('float')
  daily!: number;
}
