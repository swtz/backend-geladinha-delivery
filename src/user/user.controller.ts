import {
  Body,
  Controller,
  Get,
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

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @Roles(Role.Operator)
  async findOne(@Req() req: AuthenticatedRequest) {
    const user = await this.userService.findOneByOrFail({
      id: req.user.id,
    });
    return user;
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const user = await this.userService.create(dto);
    return user;
  }

  // @UseGuards(JwtAuthGuard)
  // @Req() req: AuthenticatedRequest,
  @Patch('me')
  async update(@Body() dto: UpdateUserDto) {
    const user = await this.userService.update(
      'e9f1fee3-d963-409f-a054-da1505b5ece8',
      dto,
    );
    return user;
  }

  // @UseGuards(JwtAuthGuard)
  // @Patch('me/password')
  // async updatePassword(
  //   @Req() req: AuthenticatedRequest,
  //   @Body() dto: UpdatePasswordDto,
  // ) {
  //   const user = await this.userService.updatePassword(req.user.id, dto);
  //   return new ResponseUserDto(user);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Delete('me')
  // async remove(@Req() req: AuthenticatedRequest) {
  //   const user = await this.userService.remove(req.user.id);
  //   return new ResponseUserDto(user);
  // }
}
