import { Injectable } from '@nestjs/common';
import { HashingService } from 'src/common/hashing/hashing.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly hashingService: HashingService,
  ) {}
}
