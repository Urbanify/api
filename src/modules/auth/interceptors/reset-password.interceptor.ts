import { TokenAction } from '@infra/mail/mail.dto';
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { env } from '@shared/env';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class ResetPasswordValidationInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    const { token, newPassword, newPasswordConfirmation } = request?.body;

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: env.jwtSecret,
      });

      const user = payload.user;

      const action = payload.action;

      if (action !== TokenAction.RESET_PASSWORD) {
        throw new UnauthorizedException();
      }

      if (newPassword !== newPasswordConfirmation) {
        throw new BadRequestException('passwords do not match');
      }

      request['user'] = user;
    } catch (error) {
      throw new UnauthorizedException();
    }

    return next.handle();
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type == 'Bearer' ? token : undefined;
  }
}
