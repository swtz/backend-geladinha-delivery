import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseUserDto } from './dto/response-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @UseGuards(JwtAuthGuard)
  // @Get('me')
  // async findOne(@Req() req: AuthenticatedRequest) {
  //   const user = await this.userService.findOneByOrFail({ id: req.user.id });
  //   return new ResponseUserDto(user);
  // }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const user = await this.userService.create(dto);
    return user;
  }

  // @UseGuards(JwtAuthGuard)
  // @Patch('me')
  // async update(@Req() req: AuthenticatedRequest, @Body() dto: UpdateUserDto) {
  //   const user = await this.userService.update(req.user.id, dto);
  //   return new ResponseUserDto(user);
  // }

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
