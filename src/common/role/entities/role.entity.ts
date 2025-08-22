import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Roles } from '../roles.enum';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ enum: Object.values(Roles) })
  name: Roles;

  @ManyToMany(() => User, user => user.roles)
  users: User[];
}
