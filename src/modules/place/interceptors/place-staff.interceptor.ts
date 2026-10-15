import { UserRole } from '@modules/auth/entities/user.entity';
import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { env } from '@shared/env';
import { extractTokenFromHeader } from '@shared/extract-token';
import { isUUID } from 'class-validator';
import { Observable } from 'rxjs';

// OWNER and ADMIN only. Unlike the shared interceptors, a wrong role gets 403
// so the frontend does not treat it as an expired session (401).
// The city comes from the token; ADMIN picks it with X-CityId.
@Injectable()
export class PlaceStaffInterceptor implements NestInterceptor {
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

    let user;

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: env.jwtSecret,
      });

      user = payload.user;
    } catch (error) {
      throw new UnauthorizedException();
    }

    if (user.role !== UserRole.OWNER && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException();
    }

    if (user.role === UserRole.ADMIN) {
      const cityId = request.headers['x-cityid'];

      if (!cityId || !isUUID(cityId)) {
        throw new UnauthorizedException();
      }

      user.cityId = cityId;
    }

    request['user'] = user;

    return next.handle();
  }
}
