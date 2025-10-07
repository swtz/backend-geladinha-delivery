import { Controller, Get } from '@nestjs/common';
import { SettlementService } from './settlement.service';

@Controller('settlement')
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @Get()
  preview() {
    return this.settlementService.preview({
      name: 'Neo',
    });
  }
}
