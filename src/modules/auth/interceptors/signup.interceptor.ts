import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { env } from '@shared/env';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class SignupValidationInterceptor implements NestInterceptor {
  constructor() {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    const { role, cityId } = request?.body;

    if (!cityId && role !== UserRole.ADMIN) {
      throw new UnauthorizedException();
    }

    if (role === UserRole.ADMIN) {
      const apiKey = request?.headers['api-key'];

      if (!apiKey) {
        throw new UnauthorizedException();
      }

      if (apiKey !== env.apiKey) {
        throw new UnauthorizedException();
      }
    }

    return next.handle();
  }
}
