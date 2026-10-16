import { DeviceTokenRepository } from '@infra/database/prisma/repositories/device-token/device-token.repository';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UserType } from '@shared/decorators/active-user.decorator';
import { env } from '@shared/env';

import { RegisterDeviceDto } from './dto/register-device.dto';
import { SendCityNotificationDto } from './dto/send-city-notification.dto';

export type PushMessage = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

type ExpoTicket = {
  status: 'ok' | 'error';
  details?: { error?: string };
};

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const BATCH_SIZE = 100;
const TIMEOUT_MS = 10_000;
const CITY_BROADCASTS_PER_DAY = 5;

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  // ponytail: per-city counter in memory, so it resets on deploy and is per instance. Move it to
  // Postgres before running a second API machine.
  private readonly cityBroadcasts = new Map<
    string,
    { day: string; count: number }
  >();

  constructor(private readonly deviceTokenRepository: DeviceTokenRepository) {}

  public async registerDevice(
    userType: UserType,
    registerDeviceDto: RegisterDeviceDto,
  ): Promise<void> {
    await this.deviceTokenRepository.upsert({
      token: registerDeviceDto.token,
      userId: userType.id,
      platform: registerDeviceDto.platform,
    });
  }

  public async removeDevice(userType: UserType, token: string): Promise<void> {
    await this.deviceTokenRepository.deleteOwned(token, userType.id);
  }

  // Never throws: a push failure must not fail the action that triggered it.
  public async sendToUsers(
    userIds: string[],
    message: PushMessage,
  ): Promise<number> {
    try {
      const tokens =
        await this.deviceTokenRepository.findTokensByUserIds(userIds);
      await this.sendToTokens(tokens, message);
      return tokens.length;
    } catch (error) {
      this.logger.error(`Push to users failed: ${reason(error)}`);
      return 0;
    }
  }

  public async broadcastToCity(
    userType: UserType,
    sendCityNotificationDto: SendCityNotificationDto,
  ): Promise<number> {
    const cityId = userType.cityId;
    const day = brazilDay();
    const today = this.cityBroadcasts.get(cityId);
    const count = today?.day === day ? today.count : 0;

    if (count >= CITY_BROADCASTS_PER_DAY) {
      throw new HttpException(
        'daily limit of notifications reached for this city',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.cityBroadcasts.set(cityId, { day, count: count + 1 });

    const tokens = await this.deviceTokenRepository.findTokensByCityId(cityId);

    await this.sendToTokens(tokens, {
      title: sendCityNotificationDto.title,
      body: sendCityNotificationDto.body,
      data: sendCityNotificationDto.url
        ? { url: sendCityNotificationDto.url }
        : {},
    });

    this.logger.log(
      `City broadcast by user ${userType.id} (${userType.role}) to city ${cityId}: ${tokens.length} devices`,
    );

    return tokens.length;
  }

  private async sendToTokens(
    tokens: string[],
    message: PushMessage,
  ): Promise<void> {
    for (let start = 0; start < tokens.length; start += BATCH_SIZE) {
      await this.sendBatch(tokens.slice(start, start + BATCH_SIZE), message);
    }
  }

  private async sendBatch(
    tokens: string[],
    message: PushMessage,
  ): Promise<void> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      if (env.expoAccessToken) {
        headers.Authorization = `Bearer ${env.expoAccessToken}`;
      }

      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(
          tokens.map((to) => ({
            to,
            title: message.title,
            body: message.body,
            data: message.data ?? {},
            sound: 'default',
            priority: 'high',
            channelId: 'default',
          })),
        ),
        signal: controller.signal,
      });

      if (!response.ok) {
        this.logger.error(
          `Expo push responded ${response.status} for a batch of ${tokens.length}`,
        );
        return;
      }

      // Expo answers with one ticket per message, in the same order.
      const { data: tickets = [] } = (await response.json()) as {
        data?: ExpoTicket[];
      };

      const unregistered = tokens.filter(
        (_, index) => tickets[index]?.details?.error === 'DeviceNotRegistered',
      );

      if (unregistered.length > 0) {
        await this.deviceTokenRepository.deleteTokens(unregistered);
        this.logger.log(`Removed ${unregistered.length} unregistered devices`);
      }

      const failed = tickets.filter((ticket) => ticket.status === 'error');
      if (failed.length > 0) {
        this.logger.warn(`Expo rejected ${failed.length} messages in a batch`);
      }
    } catch (error) {
      this.logger.error(`Expo push batch failed: ${reason(error)}`);
    } finally {
      clearTimeout(timer);
    }
  }
}

function brazilDay(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
  }).format(now);
}

function reason(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}
