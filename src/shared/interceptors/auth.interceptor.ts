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
import { Observable } from 'rxjs';
import { UserRole } from 'src/modules/auth/entities/user.entity';

@Injectable()
export class AuthValidationInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    const token = extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    const cityId = request.headers['x-cityid'];

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: env.jwtSecret,
      });

      const user = payload.user;

      const role = user.role;

      if (role === UserRole.ADMIN && !cityId) {
        throw new Error('Missing X-CityId in header');
      }

      if (role === UserRole.ADMIN) {
        user.cityId = cityId;
      }

      request['user'] = user;
    } catch (error) {
      throw new UnauthorizedException();
    }

    return next.handle();
  }
}
