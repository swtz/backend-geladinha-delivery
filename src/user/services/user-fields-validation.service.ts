import { UserService } from '../user.service';

export class UserFieldsValidationService {
  constructor(private readonly userService: UserService) {}

  async validateUniqueFields() {}
}
