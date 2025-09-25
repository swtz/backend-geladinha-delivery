import { Module } from '@nestjs/common';
import { TipService } from './tip.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tip } from './entities/tip.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tip])],
  providers: [TipService],
  exports: [TipService],
})
export class TipModule {}
