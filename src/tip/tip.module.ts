import { Module } from '@nestjs/common';
import { TipService } from './tip.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tip } from './entities/tip.entity';
import { TipController } from './tip.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tip])],
  controllers: [TipController],
  providers: [TipService],
  exports: [TipService],
})
export class TipModule {}
