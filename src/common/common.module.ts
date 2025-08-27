import { Module } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { BcryptHashingService } from './hashing/bcrypt-hashing.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './role/entities/role.entity';
import { RoleService } from './role/role.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [
    {
      provide: HashingService,
      useClass: BcryptHashingService,
    },
    RoleService,
  ],
  exports: [HashingService, RoleService],
})
export class CommonModule {}
