import { Controller, Delete, Param, ParseUUIDPipe } from '@nestjs/common';
import { TipService } from './tip.service';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';

@Roles(Role.Admin, Role.Operator)
@Controller('tip')
export class TipController {
  constructor(private readonly tipService: TipService) {}
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const tip = await this.tipService.remove(id);
    return tip;
  }
}
