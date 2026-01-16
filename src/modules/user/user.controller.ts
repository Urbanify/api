import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ActiveUser, UserType } from '@shared/decorators/active-user.decorator';
import { AdminOrOwnerValidationInterceptor } from '@shared/interceptors/admin-or-owner.interceptor';
import { AuthValidationInterceptor } from '@shared/interceptors/auth.interceptor';
import { NotResidentValidationInterceptor } from '@shared/interceptors/not-resident.interceptor';

import { ChangeRoleDto } from './dto/change-role.dto';
import { ListUsersQueryDto } from './dto/list-users.dto';
import { ListUsersResponseDto } from './dto/list-users-response.dto';
import { UserMeResponseDto } from './dto/user-me-response.dto';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'List users' })
  @ApiResponse({
    status: 200,
    description: 'Return a list of users',
    type: ListUsersResponseDto,
  })
  @UseInterceptors(AdminOrOwnerValidationInterceptor)
  public async list(
    @ActiveUser() userType: UserType,
    @Query() filter: ListUsersQueryDto,
  ) {
    const users = await this.userService.list(userType, filter);

    return users;
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Change user role' })
  @ApiResponse({ status: 200, description: 'Role changed successfully' })
  @UseInterceptors(NotResidentValidationInterceptor)
  public async changeRole(
    @Param('id') userId: string,
    @Body() changeRoleDto: ChangeRoleDto,
    @ActiveUser() userType: UserType,
  ) {
    await this.userService.changeRole(userId, changeRoleDto.role, userType);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({
    status: 200,
    description: 'Return the current user info',
    type: UserMeResponseDto,
  })
  @UseInterceptors(AuthValidationInterceptor)
  public async getMe(@ActiveUser() userType: UserType) {
    return this.userService.getMe(userType.id);
  }
}
