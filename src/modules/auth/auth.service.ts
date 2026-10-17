import { CityRepository } from '@infra/database/prisma/repositories/city/city.repository';
import { LoginCodeRepository } from '@infra/database/prisma/repositories/login-code/login-code.repository';
import { UserRepository } from '@infra/database/prisma/repositories/user/user.repository';
import { MailService } from '@infra/mail/mail.service';
import { CityStatus } from '@modules/city/entities/city.entity';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { env } from '@shared/env';
import { UUIDGenerator } from '@shared/uuid-generator';
import { hash } from 'bcrypt';
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';

import { RequestOtpDto } from './dto/request-otp.dto';
import { SignupDto } from './dto/signup.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { User, UserRole } from './entities/user.entity';

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_INTERVAL_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
const SIGNUP_TOKEN_TTL = '30m';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isReviewLogin(email: string) {
  return (
    !!env.reviewEmail &&
    !!env.reviewCode &&
    email === normalizeEmail(env.reviewEmail)
  );
}

function reviewCodeMatches(code: string) {
  const expected = Buffer.from(env.reviewCode ?? '');
  const received = Buffer.from(code);

  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}

function hashCode(email: string, code: string) {
  return createHmac('sha256', env.jwtSecret)
    .update(`${email}:${code}`)
    .digest('hex');
}

// Signup tokens use a different secret, so they never pass the login interceptors.
function signupSecret() {
  return `${env.jwtSecret}:signup`;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly loginCodeRepository: LoginCodeRepository,
    private readonly cityRepository: CityRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  public async signup(signupDto: SignupDto) {
    let payload: { email: string };

    try {
      payload = await this.jwtService.verifyAsync(signupDto.signupToken, {
        secret: signupSecret(),
      });
    } catch {
      throw new BadRequestException('invalid or expired signup');
    }

    const email = normalizeEmail(payload.email);

    const userWithEmail = await this.userRepository.findByEmail(email);

    if (userWithEmail) {
      throw new ConflictException(`user with email ${email} already exists`);
    }

    const city = await this.cityRepository.findById(signupDto.cityId);

    if (city?.status !== CityStatus.ACTIVE) {
      throw new BadRequestException('invalid city');
    }

    const now = new Date();

    const user: User = {
      id: UUIDGenerator.generate(),
      name: signupDto.name,
      surname: signupDto.surname,
      email,
      // ponytail: column kept for v2 schema compatibility, unused since OTP login
      password: await hash(UUIDGenerator.generate(), 10),
      cpf: null,
      cityId: signupDto.cityId,
      role: UserRole.RESIDENT,
      createdAt: now,
      updatedAt: now,
    };

    await this.userRepository.create(user);

    return { token: await this.signLoginToken(user) };
  }

  public async requestOtp(requestOtpDto: RequestOtpDto) {
    const email = normalizeEmail(requestOtpDto.email);

    if (isReviewLogin(email)) {
      return { ok: true };
    }

    const lastCode = await this.loginCodeRepository.findLatestByEmail(email);

    if (
      lastCode &&
      Date.now() - lastCode.createdAt.getTime() < RESEND_INTERVAL_MS
    ) {
      throw new HttpException(
        'wait 60 seconds before requesting a new code',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Known and unknown emails get the same flow, so the response does not reveal which ones exist.
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');

    await this.loginCodeRepository.deleteByEmail(email);
    await this.loginCodeRepository.create({
      email,
      codeHash: hashCode(email, code),
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    });

    await this.mailService.send({
      to: email,
      subject: `Seu código de acesso à Urbanify: ${code}`,
      html: `<p>Use o código abaixo para entrar na Urbanify:</p><p style="font-size: 32px; font-weight: bold; letter-spacing: 6px;">${code}</p><p>Vale por 10 minutos. Se não foi você, ignore este e-mail.</p>`,
      text: `Use o código abaixo para entrar na Urbanify:

${code}

Vale por 10 minutos. Se não foi você, ignore este e-mail.`,
    });

    return { ok: true };
  }

  public async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const email = normalizeEmail(verifyOtpDto.email);

    const invalidCode = () =>
      new BadRequestException('invalid or expired code');

    if (isReviewLogin(email)) {
      if (!reviewCodeMatches(verifyOtpDto.code)) {
        throw invalidCode();
      }

      return this.loginOrSignupToken(email);
    }

    const loginCode = await this.loginCodeRepository.findLatestByEmail(email);

    if (!loginCode) {
      throw invalidCode();
    }

    if (loginCode.expiresAt.getTime() <= Date.now()) {
      await this.loginCodeRepository.deleteByEmail(email);
      throw invalidCode();
    }

    if (loginCode.attempts >= MAX_ATTEMPTS) {
      await this.loginCodeRepository.deleteByEmail(email);
      throw invalidCode();
    }

    const storedHash = Buffer.from(loginCode.codeHash, 'hex');
    const receivedHash = Buffer.from(hashCode(email, verifyOtpDto.code), 'hex');

    if (!timingSafeEqual(storedHash, receivedHash)) {
      await this.loginCodeRepository.incrementAttempts(loginCode.id);
      throw invalidCode();
    }

    await this.loginCodeRepository.deleteByEmail(email);

    return this.loginOrSignupToken(email);
  }

  private async loginOrSignupToken(email: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      const signupToken = await this.jwtService.signAsync(
        { email, action: 'signup' },
        { secret: signupSecret(), expiresIn: SIGNUP_TOKEN_TTL },
      );

      return { signupToken };
    }

    return {
      token: await this.signLoginToken(user),
    };
  }

  private signLoginToken(user: User) {
    return this.jwtService.signAsync({
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        role: user.role,
        cityId: user.cityId,
      },
    });
  }
}
