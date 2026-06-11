import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { MotorcycleService } from '../services/motorcycle.service';
import { CreateMotorcycleDto } from '../dtos/motorcycle/create-motorcycle.dto';
import { ResponseMotorcycleDto } from '../dtos/motorcycle/response-motorcycle.dto';
import { ParseBrPhonePipe } from '../pipes/format-br-phone.pipe';

@Controller('motorcycle')
export class MotorcycleController {
  constructor(private readonly motorcycleService: MotorcycleService) {}

  @Post()
  async create(@Body() dto: CreateMotorcycleDto) {
    const motorcycle = await this.motorcycleService.create(dto);
    return new ResponseMotorcycleDto(motorcycle);
  }

  @Get()
  async findAll(
    @Query('year') year: string,
    @Query('model') model: string,
    @Query('displacement') displacement: string,
    @Query('color') color: string,
    @Query('brand') brand: string,
    @Query('isActive', new ParseBoolPipe({ optional: true })) isActive: boolean,
    @Query('id', new ParseUUIDPipe({ optional: true })) id: string,
    @Query('name') name: string,
    @Query('lastName') lastName: string,
    @Query('nickname') nickname: string,
    @Query('phone', ParseBrPhonePipe) phone: string,
    @Query('secondPhone', ParseBrPhonePipe) secondPhone: string,
  ) {
    const motorcycles = await this.motorcycleService.findAll({
      year,
      model,
      displacement,
      color,
      brand,
      isActive,
      owner: {
        id,
        name,
        lastName,
        nickname,
        phone,
        secondPhone,
      },
    });
    const parsedMotorcycles = motorcycles.map(
      item => new ResponseMotorcycleDto(item),
    );
    return parsedMotorcycles;
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const motorcycle = await this.motorcycleService.findOneByOrFail({ id });
    return new ResponseMotorcycleDto(motorcycle);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const motorcycle = await this.motorcycleService.remove(id);
    return new ResponseMotorcycleDto(motorcycle);
  }
}
