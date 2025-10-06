import { Module } from '@nestjs/common';
import { SettlementService } from './settlement.service';
import { SettlementController } from './settlement.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Settlement } from './entities/settlement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Settlement])],
  controllers: [SettlementController],
  providers: [SettlementService],
})
export class SettlementModule {}
