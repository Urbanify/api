import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActiveUser, UserType } from '@shared/decorators/active-user.decorator';
import { AdminOrOwnerValidationInterceptor } from '@shared/interceptors/admin-or-owner.interceptor';
import { AuthValidationInterceptor } from '@shared/interceptors/auth.interceptor';

import { RegisterDeviceDto } from './dto/register-device.dto';
import { SendCityNotificationDto } from './dto/send-city-notification.dto';
import { PushService } from './push.service';

@ApiTags('Push')
@Controller()
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Post('devices')
  @UseInterceptors(AuthValidationInterceptor)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Register the push token of the user device' })
  async registerDevice(
    @Body() registerDeviceDto: RegisterDeviceDto,
    @ActiveUser() userType: UserType,
  ) {
    await this.pushService.registerDevice(userType, registerDeviceDto);
  }

  @Delete('devices/:token')
  @UseInterceptors(AuthValidationInterceptor)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a push token owned by the user' })
  async removeDevice(
    @Param('token') token: string,
    @ActiveUser() userType: UserType,
  ) {
    await this.pushService.removeDevice(userType, token);
  }

  @Post('notifications/city')
  @UseInterceptors(AdminOrOwnerValidationInterceptor)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Send a push notification to the city devices' })
  async broadcastToCity(
    @Body() sendCityNotificationDto: SendCityNotificationDto,
    @ActiveUser() userType: UserType,
  ) {
    const sent = await this.pushService.broadcastToCity(
      userType,
      sendCityNotificationDto,
    );

    return { sent };
  }
}
