import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { env } from '@shared/env';
import { extractTokenFromHeader } from '@shared/extract-token';
import { UserRole } from 'src/modules/auth/entities/user.entity';

@Injectable()
export class NotResidentValidationInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();

    const token = extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: env.jwtSecret,
      });

      const user = payload.user;

      const role = user.role;

      if (role === UserRole.RESIDENT) {
        throw new UnauthorizedException();
      }

      request['user'] = user;
    } catch (error) {
      throw new UnauthorizedException();
    }

    return next.handle();
  }
}
