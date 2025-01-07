import { UserRepository } from '@infra/database/prisma/repositories/user/user.repository';
import { MailService } from '@infra/mail/mail.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserType } from '@shared/decorators/active-user.decorator';

import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { User, UserRole } from './entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;
  let jwtService: JwtService;
  let mailService: MailService;

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
            findById: jest.fn().mockResolvedValue(null),
            update: jest.fn().mockResolvedValue(null),
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
        password: '12345678',
        cpf: '12345678910',
        cityId: 'b6281bf4-bb46-490f-b59d-6db9e89f8ca8',
        role: UserRole.ADMIN,
      };

      await service.signup(signupInput);

      expect(userRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw a conflict exception with cpf', async () => {
      const user: User = {
        id: 'b6281bf4-bb46-490f-b59d-6db9e89f8ca8',
        name: 'John',
        surname: 'Doe',
        email: 'john@doe.com',
        password: '12345678',
        cpf: '12345678910',
        cityId: 'b6281bf4-bb46-490f-b59d-6db9e89f8ca8',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const conflictException = new ConflictException(
        `user with cpf ${user.cpf} already exists`,
      );

      jest.spyOn(userRepository, 'findByCpf').mockResolvedValueOnce(user);

      const signupInput: SignupDto = {
        ...user,
      };

      expect(service.signup(signupInput)).rejects.toEqual(conflictException);
    });

    it('should throw a conflict exception with email', async () => {
      const user: User = {
        id: 'b6281bf4-bb46-490f-b59d-6db9e89f8ca8',
        name: 'John',
        surname: 'Doe',
        email: 'john@doe.com',
        password: '12345678',
        cpf: '12345678910',
        cityId: 'b6281bf4-bb46-490f-b59d-6db9e89f8ca8',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const conflictException = new ConflictException(
        `user with email ${user.email} already exists`,
      );

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(user);

      const signupInput: SignupDto = {
        ...user,
      };

      expect(service.signup(signupInput)).rejects.toEqual(conflictException);
    });
  });

  describe('signin', () => {
    it('should signin an user', async () => {
      const user: User = {
        id: 'b6281bf4-bb46-490f-b59d-6db9e89f8ca8',
        name: 'John',
        surname: 'Doe',
        email: 'john@doe.com',
        password:
          '$2b$10$C3B2DiJugzy1JlkRW2a.YuehWjYMpB307Qg860GgNG0N4Fhfsfhei',
        cpf: '12345678910',
        cityId: 'b6281bf4-bb46-490f-b59d-6db9e89f8ca8',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(userRepository, 'findByCpf').mockResolvedValueOnce(user);

      const signinInput: SigninDto = {
        cpf: '12345678910',
        password: '12345678',
      };

      const token = await service.signin(signinInput);

      expect(userRepository.findByCpf).toHaveBeenCalledTimes(1);
      expect(token).toBeDefined();
    });

    it('should throw a not found exception because user not found', async () => {
      const signinInput: SigninDto = {
        cpf: '12345678910',
        password: '12345678',
      };

      const notFoundException = new NotFoundException(
        `user with cpf ${signinInput.cpf} not found`,
      );

      expect(service.signin(signinInput)).rejects.toEqual(notFoundException);
    });

    it('should throw a bad request exception because credentials do not match', async () => {
      const user: User = {
        id: 'b6281bf4-bb46-490f-b59d-6db9e89f8ca8',
        name: 'John',
        surname: 'Doe',
        email: 'john@doe.com',
        password:
          '$2b$10$C3B2DiJugzy1JlkRW2a.YuehWjYMpB307Qg860GgNG0N4Fhfsfhei',
        cpf: '12345678910',
        cityId: 'b6281bf4-bb46-490f-b59d-6db9e89f8ca8',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(userRepository, 'findByCpf').mockResolvedValueOnce(user);

      const signinInput: SigninDto = {
        cpf: '12345678910',
        password: '123456789',
      };

      const badRequestException = new BadRequestException(
        'credentials do not match',
      );

      expect(service.signin(signinInput)).rejects.toEqual(badRequestException);
    });
  });

  describe('forgot-password', () => {
    it('should send a reset password email to the user', async () => {
      const user: User = {
        id: 'b6281bf4-bb46-490f-b59d-6db9e89f8ca8',
        name: 'John',
        surname: 'Doe',
        email: 'john@doe.com',
        password:
          '$2b$10$C3B2DiJugzy1JlkRW2a.YuehWjYMpB307Qg860GgNG0N4Fhfsfhei',
        cpf: '12345678910',
        cityId: 'b6281bf4-bb46-490f-b59d-6db9e89f8ca8',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(userRepository, 'findByCpf').mockResolvedValueOnce(user);

      const forgotPasswordInput: ForgotPasswordDto = {
        cpf: user.cpf,
      };

      const result = await service.forgotPassword(forgotPasswordInput);

      expect(userRepository.findByCpf).toHaveBeenCalledTimes(1);
      expect(mailService.send).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        sentTo: user.email,
      });
    });

    it('should throw a not found exception because user not found', async () => {
      const cpf = '12345678910';

      const forgotPasswordInput: ForgotPasswordDto = {
        cpf,
      };

      const notFoundException = new NotFoundException(
        `user with cpf ${cpf} not found`,
      );

      expect(service.forgotPassword(forgotPasswordInput)).rejects.toEqual(
        notFoundException,
      );
    });
  });

  describe('update password', () => {
    it('sould update the user password', async () => {
      const user: User = {
        id: 'b6281bf4-bb46-490f-b59d-6db9e89f8ca8',
        name: 'John',
        surname: 'Doe',
        email: 'john@doe.com',
        password:
          '$2b$10$C3B2DiJugzy1JlkRW2a.YuehWjYMpB307Qg860GgNG0N4Fhfsfhei',
        cpf: '12345678910',
        cityId: 'b6281bf4-bb46-490f-b59d-6db9e89f8ca8',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(userRepository, 'findById').mockResolvedValueOnce(user);

      const updatePasswordInput: UpdatePasswordDto = {
        token: 'token',
        newPassword: '123456789',
        newPasswordConfirmation: '123456789',
      };

      const userType: UserType = {
        id: user.id,
        role: user.role,
        cityId: user.cityId,
      };

      await service.updatePassword(userType, updatePasswordInput);

      expect(userRepository.findById).toHaveBeenCalledTimes(1);
      expect(userRepository.update).toHaveBeenCalledTimes(1);
    });
  });
});
