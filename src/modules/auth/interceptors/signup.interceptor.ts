import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

import { UserRole } from '../entities/user.entity';

@Injectable()
export class SignupValidationInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

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

      if (apiKey !== this.configService.get('API_KEY')) {
        throw new UnauthorizedException();
      }
    }

    return next.handle();
  }
}
