import { UserRepository } from '@infra/database/prisma/repositories/user/user.repository';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UUIDGenerator } from '@shared/uuid-generator';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';

import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

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

    const token = sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    return {
      token,
    };
  }
}
