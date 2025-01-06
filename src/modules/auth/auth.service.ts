import { UserRepository } from '@infra/database/prisma/repositories/user/user.repository';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UUIDGenerator } from '@shared/uuid-generator';
import { compare, hash } from 'bcrypt';

import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { MailService } from '@infra/mail/mail.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TokenAction } from '@infra/mail/mail.dto';
import { env } from '@shared/env';
import { ConfirmResetPasswordDto } from './dto/confirm-reset-password.dto';
import { UserType } from '@shared/decorators/active-user.decorator';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  public async signup(signupDto: SignupDto) {
    const cpf = signupDto.cpf;

    const userWithCpf = await this.userRepository.findByCpf(cpf);

    if (userWithCpf) {
      throw new ConflictException(`user with cpf ${cpf} already exists`);
    }

    const email = signupDto.email;

    const userWithEmail = await this.userRepository.findByEmail(email);

    if (userWithEmail) {
      throw new ConflictException(`user with email ${email} already exists`);
    }

    const hashedPassword = await hash(signupDto.password, 10);

    const now = new Date();

    await this.userRepository.create({
      id: UUIDGenerator.generate(),
      name: signupDto.name,
      surname: signupDto.surname,
      email: signupDto.email,
      password: hashedPassword,
      cpf: signupDto.cpf,
      cityId: signupDto.cityId,
      role: signupDto.role,
      createdAt: now,
      updatedAt: now,
    });
  }

  public async signin(signinDto: SigninDto) {
    const cpf = signinDto.cpf;

    const user = await this.userRepository.findByCpf(cpf);

    if (!user) {
      throw new NotFoundException(`user with cpf ${cpf} not found`);
    }

    const passwordMatch = await compare(signinDto.password, user.password);

    if (!passwordMatch) {
      throw new BadRequestException('credentials do not match');
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
        cityId: user.cityId,
      },
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      token,
    };
  }

  public async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const cpf = resetPasswordDto.cpf;

    const user = await this.userRepository.findByCpf(cpf);

    if (!user) {
      throw new NotFoundException(`user with cpf ${cpf} not found`);
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
        cityId: user.cityId,
      },
      action: TokenAction.RESET_PASSWORD,
    };

    const token = await this.jwtService.signAsync(payload);

    const frontendResetPasswordUrl = `${env.frontendUrl}?token=${token}`;

    await this.mailService.send({
      to: user.email,
      subject: 'email de teste',
      template: 'reset-password',
      payload: {
        link: frontendResetPasswordUrl,
      },
    });

    return {
      sentTo: user.email,
    };
  }

  public async confirmResetPassword(
    userType: UserType,
    confirmResetPasswordDto: ConfirmResetPasswordDto,
  ) {
    const user = await this.userRepository.findById(userType.id);

    const newPasswordHashed = await hash(
      confirmResetPasswordDto.newPassword,
      10,
    );

    await this.userRepository.update({
      ...user,
      password: newPasswordHashed,
    });
  }
}
