import { UserRole } from '@modules/auth/entities/user.entity';
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

@Injectable()
export class ManagerOwnerAdminValidationInterceptor implements NestInterceptor {
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

      if (
        role !== UserRole.MANAGER &&
        role !== UserRole.OWNER &&
        role !== UserRole.ADMIN
      ) {
        throw new UnauthorizedException();
      }

      if (role === UserRole.ADMIN && !cityId) {
        throw new UnauthorizedException();
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
