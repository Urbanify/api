import { DeviceTokenRepository } from '@infra/database/prisma/repositories/device-token/device-token.repository';
import { UserRole } from '@modules/auth/entities/user.entity';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { env } from '@shared/env';
import * as request from 'supertest';

import { PushController } from './push.controller';
import { PushService } from './push.service';

const CITY_A = '2a6a2b50-5e6b-4a5a-9c6e-9a0c321c4f01';
const CITY_B = '7f1c3e2a-0d4b-4c8e-9a11-5b6d7e8f9a0b';
const USER_ID = '0583d6b8-888b-4b17-adf2-f5d3f124dbe8';
const TOKEN = 'ExponentPushToken[test-123]';
const BROADCAST = { title: 'Aviso', body: 'Coleta adiada' };

describe('PushController', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let repository: Record<string, jest.Mock>;

  const sign = (role: UserRole, cityId: string | null = CITY_A) =>
    jwtService.sign({
      user: { id: USER_ID, name: 'Carlos', surname: 'Lima', role, cityId },
    });

  beforeEach(async () => {
    env.jwtSecret = 'push-test-secret';

    repository = {
      upsert: jest.fn().mockResolvedValue(undefined),
      deleteOwned: jest.fn().mockResolvedValue(undefined),
      findTokensByUserIds: jest.fn().mockResolvedValue([]),
      findTokensByCityId: jest.fn().mockResolvedValue([]),
      deleteTokens: jest.fn().mockResolvedValue(undefined),
    };

    // A fresh app per test: the daily city limit is an in-memory counter on PushService.
    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: env.jwtSecret })],
      controllers: [PushController],
      providers: [
        PushService,
        { provide: DeviceTokenRepository, useValue: repository },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: false, transform: true }),
    );
    await app.init();

    jwtService = moduleRef.get(JwtService);
  });

  afterEach(async () => {
    await app.close();
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest
      .spyOn(global, 'fetch')
      .mockImplementation(
        async () => new Response(JSON.stringify({ data: [{ status: 'ok' }] })),
      );
  });

  describe('POST /devices', () => {
    it('requires a login', async () => {
      await request(app.getHttpServer())
        .post('/devices')
        .send({ token: TOKEN, platform: 'ios' })
        .expect(401);

      expect(repository.upsert).not.toHaveBeenCalled();
    });

    it('stores the token for the caller', async () => {
      await request(app.getHttpServer())
        .post('/devices')
        .set('Authorization', `Bearer ${sign(UserRole.RESIDENT)}`)
        .send({ token: TOKEN, platform: 'ios' })
        .expect(204);

      expect(repository.upsert).toHaveBeenCalledWith({
        token: TOKEN,
        userId: USER_ID,
        platform: 'ios',
      });
    });

    it('rejects a token that is not an Expo push token', async () => {
      await request(app.getHttpServer())
        .post('/devices')
        .set('Authorization', `Bearer ${sign(UserRole.RESIDENT)}`)
        .send({ token: 'not-a-token', platform: 'ios' })
        .expect(400);

      expect(repository.upsert).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /devices/:token', () => {
    it('deletes only the caller token', async () => {
      await request(app.getHttpServer())
        .delete(`/devices/${encodeURIComponent(TOKEN)}`)
        .set('Authorization', `Bearer ${sign(UserRole.RESIDENT)}`)
        .expect(204);

      expect(repository.deleteOwned).toHaveBeenCalledWith(TOKEN, USER_ID);
    });
  });

  describe('POST /notifications/city', () => {
    it.each([UserRole.RESIDENT, UserRole.MANAGER])(
      'refuses a %s',
      async (role) => {
        await request(app.getHttpServer())
          .post('/notifications/city')
          .set('Authorization', `Bearer ${sign(role)}`)
          .send(BROADCAST)
          .expect(401);

        expect(repository.findTokensByCityId).not.toHaveBeenCalled();
      },
    );

    it('sends to the city of the owner token and answers 202', async () => {
      repository.findTokensByCityId.mockResolvedValue([TOKEN]);

      const response = await request(app.getHttpServer())
        .post('/notifications/city')
        .set('Authorization', `Bearer ${sign(UserRole.OWNER, CITY_A)}`)
        .send(BROADCAST)
        .expect(202);

      expect(response.body).toEqual({ sent: 1 });
      expect(repository.findTokensByCityId).toHaveBeenCalledWith(CITY_A);
    });

    it('requires X-CityId for an admin and ignores a city sent in the body', async () => {
      const token = sign(UserRole.ADMIN, null);

      await request(app.getHttpServer())
        .post('/notifications/city')
        .set('Authorization', `Bearer ${token}`)
        .send(BROADCAST)
        .expect(401);

      await request(app.getHttpServer())
        .post('/notifications/city')
        .set('Authorization', `Bearer ${token}`)
        .set('X-CityId', CITY_B)
        .send({ ...BROADCAST, cityId: CITY_A })
        .expect(202);

      expect(repository.findTokensByCityId).toHaveBeenCalledTimes(1);
      expect(repository.findTokensByCityId).toHaveBeenCalledWith(CITY_B);
    });

    it('answers 429 on the sixth broadcast of the day for the same city', async () => {
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/notifications/city')
          .set('Authorization', `Bearer ${sign(UserRole.OWNER, CITY_A)}`)
          .send(BROADCAST)
          .expect(202);
      }

      await request(app.getHttpServer())
        .post('/notifications/city')
        .set('Authorization', `Bearer ${sign(UserRole.OWNER, CITY_A)}`)
        .send(BROADCAST)
        .expect(429);
    });

    it('rejects a url that leaves the app', async () => {
      await request(app.getHttpServer())
        .post('/notifications/city')
        .set('Authorization', `Bearer ${sign(UserRole.OWNER, CITY_A)}`)
        .send({ ...BROADCAST, url: '//evil.example' })
        .expect(400);
    });
  });
});
