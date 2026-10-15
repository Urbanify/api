import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma.service';

type CreateLoginCodeData = {
  email: string;
  codeHash: string;
  expiresAt: Date;
};

@Injectable()
export class LoginCodeRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(data: CreateLoginCodeData): Promise<void> {
    await this.prismaService.loginCode.create({
      data,
    });
  }

  public async findLatestByEmail(email: string) {
    return this.prismaService.loginCode.findFirst({
      where: {
        email,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  public async deleteByEmail(email: string): Promise<void> {
    await this.prismaService.loginCode.deleteMany({
      where: {
        email,
      },
    });
  }

  public async incrementAttempts(id: string): Promise<void> {
    await this.prismaService.loginCode.update({
      where: {
        id,
      },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });
  }
}
