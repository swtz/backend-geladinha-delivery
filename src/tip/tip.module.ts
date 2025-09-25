import { Module } from '@nestjs/common';
import { TipService } from './tip.service';

@Module({
  providers: [TipService],
})
export class TipModule {}
