import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/user/create-user.dto';
import { UpdateUserDto } from './dtos/user/update-user.dto';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role, roles } from 'src/common/role/roles.enum';
import { UpdatePasswordDto } from './dtos/user/update-password.dto';
import { ResponseUserDto } from './dtos/user/response-user.dto';
import { ParseBrPhonePipe } from './pipes/format-br-phone.pipe';
import { CreateWorkTimeDto } from 'src/work-time/dto/create-work-time.dto';
import { UpdateWorkTimeDto } from 'src/work-time/dto/update-work-time.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('user')
@Roles(Role.Operator, Role.Motoboy, Role.Admin)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async findMe(@Req() req: AuthenticatedRequest) {
    const user = await this.userService.findOneByOrFail({
      id: req.user.id,
    });
    return new ResponseUserDto(user);
  }

  // @Get('motoboy')
  // async findAllMotoboy() {
  //   const motoboys = await this.userService.findAllMotoboy();
  //   const parsedMotoboys = motoboys.map(
  //     motoboy => new ResponseUserDto(motoboy),
  //   );
  //   return parsedMotoboys;
  // }

  @Roles(Role.Operator, Role.Admin)
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userService.findOneByOrFail({ id });
    return new ResponseUserDto(user);
  }

  @Roles(Role.Operator, Role.Admin)
  @Get()
  async findAll(
    @Query('role', new ParseEnumPipe(Role, { optional: true })) role: Role,
  ) {
    const users = await this.userService.findAll({ role });
    const parsedUsers = users.map(user => new ResponseUserDto(user));
    return parsedUsers;
  }

  @Post()
  // @Roles(Role.Admin)
  @Public()
  async create(
    @Body() userDto: CreateUserDto,
    @Body('workTime') workTime: CreateWorkTimeDto,
    @Body('phone', ParseBrPhonePipe) phone: string,
  ) {
    if (!userDto.role || !roles.includes(userDto.role)) {
      throw new BadRequestException('Função inválida');
    }

    const user = await this.userService.create({
      ...userDto,
      phone,
      workTime,
    });

    return new ResponseUserDto(user);
  }

  @Patch('me')
  async updateMe(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateUserDto,
    @Body('workTime') workTime: UpdateWorkTimeDto,
    @Body('phone', ParseBrPhonePipe) phone: string,
    @Body('secondPhone', ParseBrPhonePipe) secondPhone: string,
  ) {
    const user = await this.userService.update(req.user, {
      ...dto,
      phone,
      secondPhone,
      workTime,
    });
    return new ResponseUserDto(user);
  }

  @Roles(Role.Operator, Role.Admin)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @Body('workTime') workTime: UpdateWorkTimeDto,
    @Body('phone', ParseBrPhonePipe) phone: string,
    @Body('secondPhone', ParseBrPhonePipe) secondPhone: string,
  ) {
    const user = await this.userService.findOneByOrFail({ id });
    const updated = await this.userService.update(user, {
      ...dto,
      phone,
      secondPhone,
      workTime,
    });
    return new ResponseUserDto(updated);
  }

  @Patch('me/password')
  async updatePassword(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdatePasswordDto,
  ) {
    const user = await this.userService.updatePassword(req.user.id, dto);
    return new ResponseUserDto(user);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userService.remove(id);
    return new ResponseUserDto(user);
  }
}
