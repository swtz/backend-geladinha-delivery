import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role as RoleEnum, roles } from '../roles.enum';

@Entity()
export class Role {
  @Column({ default: () => 'gen_random_uuid()', primary: true })
  id: string;

  @Column({ enum: roles, unique: true })
  name: RoleEnum;

  @ManyToMany(() => User, user => user.roles)
  users: User[];
}
