import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { ParseBrPhonePipe } from 'src/user/pipes/format-br-phone.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto, @Body('phone', ParseBrPhonePipe) phone: string) {
    if (!(dto.email || dto.nickname || phone)) {
      throw new BadRequestException('Preencha ao menos um campo');
    }

    return this.authService.login({ ...dto, phone });
  }
}
