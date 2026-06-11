import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { MotorcycleService } from '../services/motorcycle.service';
import { CreateMotorcycleDto } from '../dtos/motorcycle/create-motorcycle.dto';

@Controller('motorcycle')
export class MotorcycleController {
  constructor(private readonly motorcycleService: MotorcycleService) {}

  @Post()
  create(@Body() dto: CreateMotorcycleDto) {
    return this.motorcycleService.create(dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const motorcycle = await this.motorcycleService.remove(id);
    return motorcycle;
  }
}
