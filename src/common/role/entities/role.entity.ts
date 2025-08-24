import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role as RoleEnum } from '../roles.enum';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ enum: Object.values(RoleEnum), unique: true })
  name: RoleEnum;

  @ManyToMany(() => User, user => user.roles)
  users: User[];
}
