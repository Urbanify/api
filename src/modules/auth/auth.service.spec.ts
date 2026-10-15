import { LoginCodeRepository } from '@infra/database/prisma/repositories/login-code/login-code.repository';
import { UserRepository } from '@infra/database/prisma/repositories/user/user.repository';
import { MailService } from '@infra/mail/mail.service';
import {
  BadRequestException,
  ConflictException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { LoginCode } from '@prisma/client';

import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { User, UserRole } from './entities/user.entity';

jest.mock('@shared/env', () => ({
  env: { jwtSecret: 'test-secret' },
}));

const invalidCodeMessage = 'invalid or expired code';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;
  let loginCodeRepository: LoginCodeRepository;
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

  // Requests a code for the user and reads it back from the email, as the user would.
  async function requestCode() {
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(user);

    const result = await service.requestOtp({ email: user.email });

    const { text } = (mailService.send as jest.Mock).mock.calls[0][0];
    const code = text.match(/\b\d{6}\b/)[0];
    const stored = (loginCodeRepository.create as jest.Mock).mock.calls[0][0];

    return { result, code, stored };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            create: jest.fn().mockResolvedValue(null),
            findByCpf: jest.fn().mockResolvedValue(null),
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
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('token'),
          },
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
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('signup', () => {
    it('should signup an user', async () => {
      const signupInput: SignupDto = {
        name: 'John',
        surname: 'Doe',
        email: 'john@doe.com',
        cpf: '12345678910',
        cityId: 'b6281bf4-bb46-490f-b59d-6db9e89f8ca8',
      };

      await service.signup(signupInput);

      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: expect.stringMatching(/^\$2b\$10\$/),
        }),
      );
    });

    it('should always create the user as a resident, ignoring any role in the body', async () => {
      const signupInput = {
        name: 'John',
        surname: 'Doe',
        email: 'john@doe.com',
        cpf: '12345678910',
        cityId: 'b6281bf4-bb46-490f-b59d-6db9e89f8ca8',
        role: UserRole.OWNER,
      } as SignupDto;

      await service.signup(signupInput);

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: UserRole.RESIDENT }),
      );
    });

    it('should throw a conflict exception with cpf', async () => {
      const conflictException = new ConflictException(
        `user with cpf ${user.cpf} already exists`,
      );

      jest.spyOn(userRepository, 'findByCpf').mockResolvedValueOnce(user);

      const signupInput: SignupDto = {
        ...user,
      };

      await expect(service.signup(signupInput)).rejects.toEqual(
        conflictException,
      );
    });

    it('should throw a conflict exception with email', async () => {
      const conflictException = new ConflictException(
        `user with email ${user.email} already exists`,
      );

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(user);

      const signupInput: SignupDto = {
        ...user,
      };

      await expect(service.signup(signupInput)).rejects.toEqual(
        conflictException,
      );
    });
  });

  describe('request otp', () => {
    it('should return ok and send nothing for an unknown email', async () => {
      const result = await service.requestOtp({ email: 'nobody@doe.com' });

      expect(result).toEqual({ ok: true });
      expect(loginCodeRepository.create).not.toHaveBeenCalled();
      expect(mailService.send).not.toHaveBeenCalled();
    });

    it('should normalize the email before looking it up', async () => {
      await service.requestOtp({ email: '  John@Doe.com ' });

      expect(userRepository.findByEmail).toHaveBeenCalledWith('john@doe.com');
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
    it('should return a token and delete the codes when the code is right', async () => {
      const { code, stored } = await requestCode();

      jest
        .spyOn(loginCodeRepository, 'findLatestByEmail')
        .mockResolvedValueOnce(loginCodeRecord(stored));
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(user);

      const result = await service.verifyOtp({ email: user.email, code });

      expect(result).toEqual({ token: 'token' });
      expect(loginCodeRepository.deleteByEmail).toHaveBeenLastCalledWith(
        user.email,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        user: {
          id: user.id,
          name: user.name,
          surname: user.surname,
          role: user.role,
          cityId: user.cityId,
        },
      });
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

    it('should reject the right code when the user no longer exists', async () => {
      const { code, stored } = await requestCode();

      jest
        .spyOn(loginCodeRepository, 'findLatestByEmail')
        .mockResolvedValueOnce(loginCodeRecord(stored));

      await expect(
        service.verifyOtp({ email: user.email, code }),
      ).rejects.toThrow(new BadRequestException(invalidCodeMessage));

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
