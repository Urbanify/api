import { Injectable } from '@nestjs/common';
import { DevicePlatform } from '@prisma/client';

import { PrismaService } from '../../prisma.service';

type UpsertDeviceTokenInput = {
  token: string;
  userId: string;
  platform: DevicePlatform;
};

@Injectable()
export class DeviceTokenRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async upsert(input: UpsertDeviceTokenInput): Promise<void> {
    const now = new Date();

    await this.prismaService.deviceToken.upsert({
      where: { token: input.token },
      create: { ...input, lastSeenAt: now },
      update: {
        userId: input.userId,
        platform: input.platform,
        lastSeenAt: now,
      },
    });
  }

  public async deleteOwned(token: string, userId: string): Promise<void> {
    await this.prismaService.deviceToken.deleteMany({
      where: { token, userId },
    });
  }

  public async findTokensByUserIds(userIds: string[]): Promise<string[]> {
    const devices = await this.prismaService.deviceToken.findMany({
      where: { userId: { in: userIds } },
      select: { token: true },
    });

    return devices.map((device) => device.token);
  }

  public async findTokensByCityId(cityId: string): Promise<string[]> {
    const devices = await this.prismaService.deviceToken.findMany({
      where: { user: { cityId } },
      select: { token: true },
    });

    return devices.map((device) => device.token);
  }

  public async deleteTokens(tokens: string[]): Promise<void> {
    await this.prismaService.deviceToken.deleteMany({
      where: { token: { in: tokens } },
    });
  }
}
