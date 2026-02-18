import { Body, Controller, Post } from '@nestjs/common';
import { MotorcycleService } from '../services/motorcycle.service';
import { CreateMotorcycleDto } from '../dtos/motorcycle/create-motorcycle.dto';

@Controller('motorcycle')
export class MotorcycleController {
  constructor(private readonly motorcycleService: MotorcycleService) {}

  @Post()
  create(@Body() dto: CreateMotorcycleDto) {
    return this.motorcycleService.create(dto);
  }
}
