import {
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
import { Role } from 'src/common/role/roles.enum';
import { UpdatePasswordDto } from './dtos/user/update-password.dto';
import { ResponseUserDto } from './dtos/user/response-user.dto';
import { ParseBrPhonePipe } from './pipes/format-br-phone.pipe';
import { Public } from 'src/auth/decorators/public.decorator';
import { UserValidators } from './types/user/user-validator.type';

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
    @Body('role', new ParseEnumPipe(Role)) role: Role,
    @Body() userDto: CreateUserDto,
  ) {
    const uniqueFieldsValidationObject: UserValidators = {
      nickname: async (nickname: string) =>
        await this.userService.failIfNicknameExists(nickname),
      email: async (email: string) =>
        await this.userService.failIfEmailExists(email),
      phone: async (phone: string) =>
        await this.userService.failIfPhoneExists(phone),
      secondPhone: async (secondPhone: string) =>
        await this.userService.failIfPhoneExists(secondPhone, true),
    } satisfies UserValidators;

    for (const field of Object.keys(
      uniqueFieldsValidationObject,
    ) as (keyof UserValidators)[]) {
      const value = userDto[field];

      if (value === undefined) continue;

      await uniqueFieldsValidationObject[field](value);
    }

    const user = await this.userService.create({
      ...userDto,
      role,
      phone,
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
