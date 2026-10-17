import { CityRepository } from '@infra/database/prisma/repositories/city/city.repository';
import { LoginCodeRepository } from '@infra/database/prisma/repositories/login-code/login-code.repository';
import { UserRepository } from '@infra/database/prisma/repositories/user/user.repository';
import { MailService } from '@infra/mail/mail.service';
import { City, CityStatus } from '@modules/city/entities/city.entity';
import {
  BadRequestException,
  ConflictException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { LoginCode } from '@prisma/client';
import { env } from '@shared/env';

import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { User, UserRole } from './entities/user.entity';

jest.mock('@shared/env', () => ({
  env: { jwtSecret: 'test-secret' },
}));

const invalidCodeMessage = 'invalid or expired code';
const invalidSignupMessage = 'invalid or expired signup';
const cityId = '2a6a2b50-5e6b-4a5a-9c6e-9a0c321c4f01';
const signupSecret = 'test-secret:signup';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;
  let loginCodeRepository: LoginCodeRepository;
  let cityRepository: CityRepository;
  let jwtService: JwtService;
  let mailService: MailService;

  const user: User = {
    id: 'b6281bf4-bb46-490f-b59d-6db9e89f8ca8',
    name: 'John',
    surname: 'Doe',
    email: 'john@doe.com',
    password: 'hashed-password',
    cpf: '12345678910',
    cityId: 'b6281bf4-bb46-490f-b59d-6db9e89f8ca8',
    role: UserRole.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const activeCity = { id: cityId, status: CityStatus.ACTIVE } as City;

  const signupInput: SignupDto = {
    signupToken: '',
    name: 'Ana',
    surname: 'Silva',
    cityId,
  };

  function loginCodeRecord(overrides: Partial<LoginCode> = {}): LoginCode {
    return {
      id: 'login-code-id',
      email: user.email,
      codeHash: '',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      attempts: 0,
      createdAt: new Date(Date.now() - 2 * 60 * 1000),
      ...overrides,
    };
  }

  // Requests a code and reads it back from the email, as the user would.
  async function requestCode(email = user.email) {
    const result = await service.requestOtp({ email });

    const { text } = (mailService.send as jest.Mock).mock.calls[0][0];
    const code = text.match(/\b\d{6}\b/)[0];
    const stored = (loginCodeRepository.create as jest.Mock).mock.calls[0][0];

    return { result, code, stored };
  }

  function signupTokenFor(email: string) {
    return jwtService.signAsync(
      { email, action: 'signup' },
      { secret: signupSecret, expiresIn: '30m' },
    );
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            create: jest.fn().mockResolvedValue(null),
            findByEmail: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: LoginCodeRepository,
          useValue: {
            create: jest.fn().mockResolvedValue(null),
            findLatestByEmail: jest.fn().mockResolvedValue(null),
            deleteByEmail: jest.fn().mockResolvedValue(null),
            incrementAttempts: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: CityRepository,
          useValue: {
            findById: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: JwtService,
          useValue: new JwtService({ secret: 'test-secret' }),
        },
        {
          provide: MailService,
          useValue: {
            send: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    loginCodeRepository = module.get<LoginCodeRepository>(LoginCodeRepository);
    cityRepository = module.get<CityRepository>(CityRepository);
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailService>(MailService);

    jest.spyOn(jwtService, 'signAsync');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('signup', () => {
    it('should create a resident with no cpf and a lowercased email from the signup token', async () => {
      const signupToken = await signupTokenFor('Ana@Silva.com');

      jest.spyOn(cityRepository, 'findById').mockResolvedValueOnce(activeCity);

      await service.signup({ ...signupInput, signupToken });

      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Ana',
          surname: 'Silva',
          email: 'ana@silva.com',
          cpf: null,
          cityId,
          role: UserRole.RESIDENT,
          password: expect.stringMatching(/^\$2b\$10\$/),
        }),
      );
    });

    it('should return a login token for the new resident', async () => {
      const signupToken = await signupTokenFor('ana@silva.com');

      jest.spyOn(cityRepository, 'findById').mockResolvedValueOnce(activeCity);

      const result = await service.signup({ ...signupInput, signupToken });

      expect(result).toEqual({ token: expect.any(String) });

      const payload = await jwtService.verifyAsync(result.token, {
        secret: 'test-secret',
      });

      expect(payload.user).toEqual(
        expect.objectContaining({
          name: 'Ana',
          surname: 'Silva',
          role: UserRole.RESIDENT,
          cityId,
        }),
      );
    });

    it('should reject a login token, which is signed with another secret', async () => {
      const loginToken = await jwtService.signAsync({
        user: { id: user.id, role: UserRole.ADMIN },
      });

      jest.spyOn(cityRepository, 'findById').mockResolvedValueOnce(activeCity);

      await expect(
        service.signup({ ...signupInput, signupToken: loginToken }),
      ).rejects.toThrow(new BadRequestException(invalidSignupMessage));

      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should throw a conflict exception when the email already has an account', async () => {
      const signupToken = await signupTokenFor(user.email);

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(user);

      await expect(
        service.signup({ ...signupInput, signupToken }),
      ).rejects.toThrow(
        new ConflictException(`user with email ${user.email} already exists`),
      );

      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should reject an unknown city', async () => {
      const signupToken = await signupTokenFor('ana@silva.com');

      await expect(
        service.signup({ ...signupInput, signupToken }),
      ).rejects.toThrow(new BadRequestException('invalid city'));

      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should reject an inactive city', async () => {
      const signupToken = await signupTokenFor('ana@silva.com');

      jest
        .spyOn(cityRepository, 'findById')
        .mockResolvedValueOnce({ ...activeCity, status: CityStatus.DISABLED });

      await expect(
        service.signup({ ...signupInput, signupToken }),
      ).rejects.toThrow(new BadRequestException('invalid city'));

      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('request otp', () => {
    it('should store a code and send it for an unknown email', async () => {
      const { result, code, stored } = await requestCode('nobody@doe.com');

      expect(result).toEqual({ ok: true });
      expect(code).toMatch(/^\d{6}$/);
      expect(stored.email).toBe('nobody@doe.com');
      expect(mailService.send).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'nobody@doe.com' }),
      );
    });

    it('should normalize the email before storing the code', async () => {
      await service.requestOtp({ email: '  John@Doe.com ' });

      expect(loginCodeRepository.findLatestByEmail).toHaveBeenCalledWith(
        'john@doe.com',
      );
      expect(loginCodeRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'john@doe.com' }),
      );
    });

    it('should throw too many requests when a code was requested less than 60 seconds ago', async () => {
      jest
        .spyOn(loginCodeRepository, 'findLatestByEmail')
        .mockResolvedValueOnce(
          loginCodeRecord({ createdAt: new Date(Date.now() - 30 * 1000) }),
        );

      await expect(
        service.requestOtp({ email: user.email }),
      ).rejects.toMatchObject({ status: HttpStatus.TOO_MANY_REQUESTS });

      expect(mailService.send).not.toHaveBeenCalled();
    });

    it('should store only a hash of the code and send the code by email', async () => {
      const { result, code, stored } = await requestCode();

      expect(result).toEqual({ ok: true });
      expect(code).toMatch(/^\d{6}$/);
      expect(stored.email).toBe(user.email);
      expect(stored.codeHash).toMatch(/^[0-9a-f]{64}$/);
      expect(stored.codeHash).not.toContain(code);
      expect(stored.expiresAt.getTime() - Date.now()).toBeGreaterThan(
        9 * 60 * 1000,
      );
      expect(stored.expiresAt.getTime() - Date.now()).toBeLessThanOrEqual(
        10 * 60 * 1000,
      );
      expect(loginCodeRepository.deleteByEmail).toHaveBeenCalledWith(
        user.email,
      );
      expect(mailService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: user.email,
          subject: expect.stringContaining(code),
        }),
      );
    });
  });

  describe('verify otp', () => {
    it('should return a login token and delete the codes when the code is right', async () => {
      const { code, stored } = await requestCode();

      jest
        .spyOn(loginCodeRepository, 'findLatestByEmail')
        .mockResolvedValueOnce(loginCodeRecord(stored));
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(user);

      const result = await service.verifyOtp({ email: user.email, code });

      expect(result).toEqual({ token: expect.any(String) });
      expect(loginCodeRepository.deleteByEmail).toHaveBeenLastCalledWith(
        user.email,
      );

      const payload = await jwtService.verifyAsync(result.token, {
        secret: 'test-secret',
      });

      expect(payload.user).toEqual({
        id: user.id,
        name: user.name,
        surname: user.surname,
        role: user.role,
        cityId: user.cityId,
      });
    });

    it('should return a signup token when the code is right and the email has no account', async () => {
      const email = 'novo@urbanify.com.br';
      const { code, stored } = await requestCode(email);

      jest
        .spyOn(loginCodeRepository, 'findLatestByEmail')
        .mockResolvedValueOnce(loginCodeRecord(stored));

      const result = await service.verifyOtp({ email, code });

      expect(result).toEqual({ signupToken: expect.any(String) });
      expect(loginCodeRepository.deleteByEmail).toHaveBeenLastCalledWith(email);

      const payload = await jwtService.verifyAsync(result.signupToken, {
        secret: signupSecret,
      });

      expect(payload).toMatchObject({ email, action: 'signup' });
      await expect(
        jwtService.verifyAsync(result.signupToken, { secret: 'test-secret' }),
      ).rejects.toThrow();
    });

    it('should reject a wrong code and count the attempt', async () => {
      const { code, stored } = await requestCode();
      const wrongCode = code === '000000' ? '000001' : '000000';

      jest
        .spyOn(loginCodeRepository, 'findLatestByEmail')
        .mockResolvedValueOnce(loginCodeRecord(stored));

      await expect(
        service.verifyOtp({ email: user.email, code: wrongCode }),
      ).rejects.toThrow(new BadRequestException(invalidCodeMessage));

      expect(loginCodeRepository.incrementAttempts).toHaveBeenCalledWith(
        'login-code-id',
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should reject an expired code', async () => {
      const { code, stored } = await requestCode();

      jest
        .spyOn(loginCodeRepository, 'findLatestByEmail')
        .mockResolvedValueOnce(
          loginCodeRecord({
            ...stored,
            expiresAt: new Date(Date.now() - 1000),
          }),
        );

      await expect(
        service.verifyOtp({ email: user.email, code }),
      ).rejects.toThrow(new BadRequestException(invalidCodeMessage));

      expect(loginCodeRepository.deleteByEmail).toHaveBeenLastCalledWith(
        user.email,
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should reject the right code after 5 failed attempts', async () => {
      const { code, stored } = await requestCode();

      jest
        .spyOn(loginCodeRepository, 'findLatestByEmail')
        .mockResolvedValueOnce(loginCodeRecord({ ...stored, attempts: 5 }));

      await expect(
        service.verifyOtp({ email: user.email, code }),
      ).rejects.toThrow(new BadRequestException(invalidCodeMessage));

      expect(loginCodeRepository.deleteByEmail).toHaveBeenLastCalledWith(
        user.email,
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should reject when no code was requested', async () => {
      await expect(
        service.verifyOtp({ email: user.email, code: '123456' }),
      ).rejects.toThrow(new BadRequestException(invalidCodeMessage));

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('store review login', () => {
    beforeEach(() => {
      env.reviewEmail = 'Review@Urbanify.com.br';
      env.reviewCode = '424242';
    });

    afterEach(() => {
      env.reviewEmail = undefined;
      env.reviewCode = undefined;
    });

    it('does not send an email for the review account', async () => {
      await expect(
        service.requestOtp({ email: 'review@urbanify.com.br' }),
      ).resolves.toEqual({ ok: true });

      expect(mailService.send).not.toHaveBeenCalled();
      expect(loginCodeRepository.create).not.toHaveBeenCalled();
    });

    it('logs the review account in with the fixed code', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(user);

      const result = await service.verifyOtp({
        email: 'review@urbanify.com.br',
        code: '424242',
      });

      expect(result).toHaveProperty('token');
    });

    it('rejects a wrong code for the review account', async () => {
      await expect(
        service.verifyOtp({ email: 'review@urbanify.com.br', code: '000000' }),
      ).rejects.toThrow(invalidCodeMessage);
    });

    it('does not accept the fixed code for other emails', async () => {
      await expect(
        service.verifyOtp({ email: 'other@urbanify.com.br', code: '424242' }),
      ).rejects.toThrow(invalidCodeMessage);
    });
  });
});
