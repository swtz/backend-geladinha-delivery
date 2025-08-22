import { User } from 'src/user/entities/user.entity';
import { ChildEntity, Column } from 'typeorm';

@ChildEntity()
export class DeliveryMan extends User {
  @Column()
  motorcycle: string;

  @Column('double', { nullable: true })
  tip: number;

  @Column('double')
  daily: number;
}
