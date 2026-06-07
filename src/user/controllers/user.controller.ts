import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dtos/user/create-user.dto';
import { UpdateUserDto } from '../dtos/user/update-user.dto';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';
import { Roles } from 'src/common/role/decorators/roles.decorator';
import { Role } from 'src/common/role/roles.enum';
import { UpdatePasswordDto } from '../dtos/user/update-password.dto';
import { ResponseUserDto } from '../dtos/user/response-user.dto';
import { ParseBrPhonePipe } from '../pipes/format-br-phone.pipe';
import { Public } from 'src/auth/decorators/public.decorator';
import { UserFieldsValidationService } from '../services/user-fields-validation.service';

@Controller('user')
@Roles(Role.Operator, Role.Motoboy, Role.Admin)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userFieldsValidationService: UserFieldsValidationService,
  ) {}

  @Get('me')
  async findMe(@Req() req: AuthenticatedRequest) {
    const user = await this.userService.findOneByOrFail({
      id: req.user.id,
    });
    return new ResponseUserDto(user);
  }

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

  // @Roles(Role.Admin)
  @Public()
  @Post()
  async create(
    @Body('phone', ParseBrPhonePipe) phone: string,
    @Body('secondPhone', ParseBrPhonePipe) secondPhone: string,
    @Body('role', new ParseEnumPipe(Role)) role: Role,
    @Body() dto: CreateUserDto,
  ) {
    if (role === Role.Motoboy || dto.role === Role.Motoboy) {
      return new ForbiddenException('Acesso negado');
    }

    await this.userFieldsValidationService.validateUniqueFields(dto);

    const user = await this.userService.create({
      ...dto,
      role,
      phone,
      secondPhone,
    });

    return new ResponseUserDto(user);
  }

  @Patch('me')
  async updateMe(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateUserDto,
    @Body('phone', ParseBrPhonePipe) phone: string,
    @Body('secondPhone', ParseBrPhonePipe) secondPhone: string,
  ) {
    await this.userFieldsValidationService.validateUniqueFields({
      ...dto,
      phone,
      secondPhone,
    });

    const user = await this.userService.update(req.user, {
      ...dto,
      phone,
      secondPhone,
    });

    return new ResponseUserDto(user);
  }

  @Roles(Role.Operator, Role.Admin)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @Body('phone', ParseBrPhonePipe) phone: string,
    @Body('secondPhone', ParseBrPhonePipe) secondPhone: string,
  ) {
    const user = await this.userService.findOneByOrFail({ id });

    await this.userFieldsValidationService.validateUniqueFields({
      ...dto,
      phone,
      secondPhone,
    });

    const updated = await this.userService.update(user, {
      ...dto,
      phone,
      secondPhone,
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

  @Roles(Role.Admin)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userService.remove(id);
    return new ResponseUserDto(user);
  }
}
