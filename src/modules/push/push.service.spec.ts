import { DeviceTokenRepository } from '@infra/database/prisma/repositories/device-token/device-token.repository';
import { UserRole } from '@modules/auth/entities/user.entity';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DevicePlatform } from '@prisma/client';
import { UserType } from '@shared/decorators/active-user.decorator';
import { env } from '@shared/env';

import { PushService } from './push.service';

const EXPO_URL = 'https://exp.host/--/api/v2/push/send';
const CITY_A = '2a6a2b50-5e6b-4a5a-9c6e-9a0c321c4f01';
const CITY_B = '7f1c3e2a-0d4b-4c8e-9a11-5b6d7e8f9a0b';
const USER_ID = '0583d6b8-888b-4b17-adf2-f5d3f124dbe8';
const TOKEN = 'ExponentPushToken[test-123]';
const MESSAGE = { title: 'Título', body: 'Corpo da mensagem' };

const user = (cityId: string): UserType => ({
  id: USER_ID,
  name: 'Carlos',
  surname: 'Lima',
  role: UserRole.OWNER,
  cityId,
});

const tokensOf = (count: number) =>
  Array.from({ length: count }, (_, i) => `ExponentPushToken[t-${i}]`);

const ticketsResponse = (tickets: object[]) =>
  new Response(JSON.stringify({ data: tickets }), { status: 200 });

const sentTo = (init: RequestInit | undefined) =>
  JSON.parse(init?.body as string) as { to: string }[];

describe('PushService', () => {
  let service: PushService;
  let repository: {
    upsert: jest.Mock;
    deleteOwned: jest.Mock;
    findTokensByUserIds: jest.Mock;
    findTokensByCityId: jest.Mock;
    deleteTokens: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      upsert: jest.fn().mockResolvedValue(undefined),
      deleteOwned: jest.fn().mockResolvedValue(undefined),
      findTokensByUserIds: jest.fn().mockResolvedValue([]),
      findTokensByCityId: jest.fn().mockResolvedValue([]),
      deleteTokens: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushService,
        { provide: DeviceTokenRepository, useValue: repository },
      ],
    }).compile();

    service = module.get(PushService);

    // Expo answers one ok ticket per message, in order.
    jest
      .spyOn(global, 'fetch')
      .mockImplementation(async (_url, init) =>
        ticketsResponse(sentTo(init).map(() => ({ status: 'ok' }))),
      );
  });

  afterEach(() => {
    env.expoAccessToken = undefined;
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('devices', () => {
    it('stores the token for the caller, taking it over from another user', async () => {
      await service.registerDevice(user(CITY_A), {
        token: TOKEN,
        platform: DevicePlatform.android,
      });

      expect(repository.upsert).toHaveBeenCalledWith({
        token: TOKEN,
        userId: USER_ID,
        platform: DevicePlatform.android,
      });
    });

    it('removes a token only through the caller id', async () => {
      await service.removeDevice(user(CITY_A), TOKEN);

      expect(repository.deleteOwned).toHaveBeenCalledWith(TOKEN, USER_ID);
    });
  });

  describe('sendToUsers', () => {
    it('sends to Expo in batches of 100', async () => {
      repository.findTokensByUserIds.mockResolvedValue(tokensOf(250));

      const sent = await service.sendToUsers([USER_ID], MESSAGE);

      expect(sent).toBe(250);
      expect(global.fetch).toHaveBeenCalledTimes(3);
      const sizes = (global.fetch as jest.Mock).mock.calls.map(
        ([url, init]) => {
          expect(url).toBe(EXPO_URL);
          return sentTo(init).length;
        },
      );
      expect(sizes).toEqual([100, 100, 50]);
    });

    it('sends only the Authorization header when EXPO_ACCESS_TOKEN is set', async () => {
      repository.findTokensByUserIds.mockResolvedValue([TOKEN]);

      await service.sendToUsers([USER_ID], MESSAGE);
      const withoutToken = (global.fetch as jest.Mock).mock.calls[0][1].headers;
      expect(withoutToken.Authorization).toBeUndefined();

      env.expoAccessToken = 'expo-secret';
      await service.sendToUsers([USER_ID], MESSAGE);
      const withToken = (global.fetch as jest.Mock).mock.calls[1][1].headers;
      expect(withToken.Authorization).toBe('Bearer expo-secret');
    });

    it('deletes only the tokens Expo reports as DeviceNotRegistered', async () => {
      const [a, b, c] = tokensOf(3);
      repository.findTokensByUserIds.mockResolvedValue([a, b, c]);
      jest
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce(
          ticketsResponse([
            { status: 'ok' },
            { status: 'error', details: { error: 'DeviceNotRegistered' } },
            { status: 'error', details: { error: 'MessageRateExceeded' } },
          ]),
        );

      await service.sendToUsers([USER_ID], MESSAGE);

      expect(repository.deleteTokens).toHaveBeenCalledTimes(1);
      expect(repository.deleteTokens).toHaveBeenCalledWith([b]);
    });

    it('never throws when Expo is unreachable', async () => {
      repository.findTokensByUserIds.mockResolvedValue([TOKEN]);
      jest
        .spyOn(global, 'fetch')
        .mockRejectedValueOnce(new Error('network down'));

      await expect(service.sendToUsers([USER_ID], MESSAGE)).resolves.toBe(1);
      expect(repository.deleteTokens).not.toHaveBeenCalled();
    });

    it('never throws when Expo answers with an error status', async () => {
      repository.findTokensByUserIds.mockResolvedValue([TOKEN]);
      jest
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce(new Response('oops', { status: 500 }));

      await expect(service.sendToUsers([USER_ID], MESSAGE)).resolves.toBe(1);
      expect(repository.deleteTokens).not.toHaveBeenCalled();
    });

    it('never throws when the token lookup fails', async () => {
      repository.findTokensByUserIds.mockRejectedValue(new Error('db down'));

      await expect(service.sendToUsers([USER_ID], MESSAGE)).resolves.toBe(0);
    });
  });

  describe('broadcastToCity', () => {
    const body = { title: 'Aviso', body: 'Coleta adiada' };

    it('allows five broadcasts per city per day and refuses the sixth', async () => {
      for (let i = 0; i < 5; i++) {
        await service.broadcastToCity(user(CITY_A), body);
      }

      await expect(
        service.broadcastToCity(user(CITY_A), body),
      ).rejects.toMatchObject({ status: HttpStatus.TOO_MANY_REQUESTS });
    });

    it('counts the limit per city', async () => {
      for (let i = 0; i < 5; i++) {
        await service.broadcastToCity(user(CITY_A), body);
      }

      await expect(service.broadcastToCity(user(CITY_B), body)).resolves.toBe(
        0,
      );
    });

    it('resets the limit on the next Brazil day', async () => {
      jest.useFakeTimers({ now: new Date('2026-10-16T15:00:00Z') });

      for (let i = 0; i < 5; i++) {
        await service.broadcastToCity(user(CITY_A), body);
      }

      jest.setSystemTime(new Date('2026-10-17T15:00:00Z'));

      await expect(service.broadcastToCity(user(CITY_A), body)).resolves.toBe(
        0,
      );
    });

    it('sends to the devices of the given city only', async () => {
      await service.broadcastToCity(user(CITY_A), body);

      expect(repository.findTokensByCityId).toHaveBeenCalledWith(CITY_A);
    });
  });
});
