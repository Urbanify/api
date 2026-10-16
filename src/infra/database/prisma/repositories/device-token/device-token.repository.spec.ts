import { DevicePlatform } from '@prisma/client';

import { DeviceTokenRepository } from './device-token.repository';
import { PrismaService } from '../../prisma.service';

const TOKEN = 'ExponentPushToken[test-123]';
const USER_A = '0583d6b8-888b-4b17-adf2-f5d3f124dbe8';
const USER_B = 'c5ca2e81-e1c5-4fbe-af5c-53d13b045380';

describe('DeviceTokenRepository', () => {
  const deviceToken = {
    upsert: jest.fn(),
    deleteMany: jest.fn(),
    findMany: jest.fn(),
  };
  const repository = new DeviceTokenRepository({
    deviceToken,
  } as unknown as PrismaService);

  afterEach(() => jest.clearAllMocks());

  it('reassigns an existing token to the new user and refreshes lastSeenAt', async () => {
    await repository.upsert({
      token: TOKEN,
      userId: USER_B,
      platform: DevicePlatform.ios,
    });

    expect(deviceToken.upsert).toHaveBeenCalledWith({
      where: { token: TOKEN },
      create: {
        token: TOKEN,
        userId: USER_B,
        platform: DevicePlatform.ios,
        lastSeenAt: expect.any(Date),
      },
      update: {
        userId: USER_B,
        platform: DevicePlatform.ios,
        lastSeenAt: expect.any(Date),
      },
    });
  });

  it('deletes a token only when it belongs to the given user', async () => {
    await repository.deleteOwned(TOKEN, USER_A);

    expect(deviceToken.deleteMany).toHaveBeenCalledWith({
      where: { token: TOKEN, userId: USER_A },
    });
  });
});
