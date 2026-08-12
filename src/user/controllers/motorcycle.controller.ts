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
import { FindOptionsOrder } from 'typeorm';
import { Motorcycle } from '../entities/motorcycle.entity';
import { ParsePlaceCodePipe } from 'src/place/pipes/parse-place-code.pipe';

@Controller('motorcycle')
export class MotorcycleController {
  constructor(private readonly motorcycleService: MotorcycleService) {}

  @Post()
  async create(@Body(ParsePlaceCodePipe) dto: CreateMotorcycleDto) {
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
    @Query('field')
    field: keyof FindOptionsOrder<Motorcycle>,
    @Query('order') order: 'asc' | 'desc' | 'ASC' | 'DESC',
    @Query('type') type: 'owner' | 'driver',
    @Query('placeCode', ParsePlaceCodePipe) placeCode: string,
  ) {
    const userData = {
      id,
      name,
      lastName,
      nickname,
      phone,
      secondPhone,
    };
    const motorcycles = await this.motorcycleService.findAll({
      year,
      model,
      displacement,
      color,
      brand,
      isActive,
      placeCode,
      [type]: type !== 'owner' ? { user: userData } : userData,
      orderParams: { [field]: order },
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
