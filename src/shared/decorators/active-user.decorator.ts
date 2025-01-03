import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import { UserRole } from 'src/modules/auth/entities/user.entity';

export type UserType = {
  id: string;
  role: UserRole;
  cityId: string;
};

export const ActiveUser = createParamDecorator<undefined>(
  (data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  },
);
