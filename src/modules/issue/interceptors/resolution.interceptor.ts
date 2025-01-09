import { UserRole } from '@modules/auth/entities/user.entity';
import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ResolutionValidationInterceptor implements NestInterceptor {
  constructor() {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    const { user } = request;

    if (user.role !== UserRole.MANAGER && user.role !== UserRole.OWNER) {
      throw new ForbiddenException();
    }

    return next.handle();
  }
}
