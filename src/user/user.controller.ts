import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ResponseUserDto } from './dto/response-user.dto';
import { ParseBrPhonePipe } from './pipes/format-br-phone.pipe';

@Controller('user')
@Roles(Role.Operator, Role.Motoboy, Role.Admin)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findOne(@Req() req: AuthenticatedRequest) {
    const user = await this.userService.findOneByOrFail({
      id: req.user.id,
    });
    return new ResponseUserDto(user);
  }

  @Roles(Role.Operator, Role.Admin)
  @UseGuards(JwtAuthGuard)
  @Get('motoboy')
  async findAllMotoboy() {
    const motoboys = await this.userService.findAllMotoboy();
    const parsedMotoboys = motoboys.map(
      motoboy => new ResponseUserDto(motoboy),
    );
    return parsedMotoboys;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @Roles(Role.Admin)
  async create(
    @Body() dto: CreateUserDto,
    @Body('phone', ParseBrPhonePipe) phone: string,
  ) {
    const user = await this.userService.create({ ...dto, phone });
    return new ResponseUserDto(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async update(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateUserDto,
    @Body('phone', ParseBrPhonePipe) phone: string,
  ) {
    const user = await this.userService.update(req.user, { ...dto, phone });
    return new ResponseUserDto(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  async updatePassword(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdatePasswordDto,
  ) {
    const user = await this.userService.updatePassword(req.user.id, dto);
    return new ResponseUserDto(user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @Roles(Role.Admin)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userService.remove(id);
    return new ResponseUserDto(user);
  }
}
