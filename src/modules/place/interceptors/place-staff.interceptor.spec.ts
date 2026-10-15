import { UserRole } from '@modules/auth/entities/user.entity';
import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { of } from 'rxjs';

import { PlaceStaffInterceptor } from './place-staff.interceptor';

const TOKEN_CITY = '2a6a2b50-5e6b-4a5a-9c6e-9a0c321c4f01';
const HEADER_CITY = '7f1c3e2a-0d4b-4c8e-9a11-5b6d7e8f9a0b';

describe('PlaceStaffInterceptor', () => {
  let interceptor: PlaceStaffInterceptor;
  let jwtService: { verifyAsync: jest.Mock };
  let next: CallHandler;

  const run = (role: UserRole | null, headers: Record<string, string> = {}) => {
    const request: any = {
      headers: { ...(role && { authorization: 'Bearer token' }), ...headers },
    };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    jwtService.verifyAsync.mockResolvedValue({
      user: { id: 'u1', name: 'A', surname: 'B', role, cityId: TOKEN_CITY },
    });

    return interceptor.intercept(context, next).then(() => request);
  };

  beforeEach(() => {
    jwtService = { verifyAsync: jest.fn() };
    interceptor = new PlaceStaffInterceptor(
      jwtService as unknown as JwtService,
    );
    next = { handle: jest.fn(() => of(null)) };
  });

  it('rejects a request without a token', async () => {
    await expect(run(null)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a MANAGER with 403', async () => {
    await expect(run(UserRole.MANAGER)).rejects.toThrow(ForbiddenException);
    expect(next.handle).not.toHaveBeenCalled();
  });

  it('rejects a RESIDENT with 403', async () => {
    await expect(run(UserRole.RESIDENT)).rejects.toThrow(ForbiddenException);
  });

  it('uses the token city for an OWNER and ignores X-CityId', async () => {
    const request = await run(UserRole.OWNER, { 'x-cityid': HEADER_CITY });

    expect(request.user.cityId).toBe(TOKEN_CITY);
    expect(next.handle).toHaveBeenCalled();
  });

  it('uses X-CityId for an ADMIN', async () => {
    const request = await run(UserRole.ADMIN, { 'x-cityid': HEADER_CITY });

    expect(request.user.cityId).toBe(HEADER_CITY);
  });

  it('rejects an ADMIN without a valid X-CityId', async () => {
    await expect(run(UserRole.ADMIN)).rejects.toThrow(UnauthorizedException);
    await expect(
      run(UserRole.ADMIN, { 'x-cityid': 'not-a-uuid' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
