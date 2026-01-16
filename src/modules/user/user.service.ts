import { UserRepository } from '@infra/database/prisma/repositories/user/user.repository';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UserType } from '@shared/decorators/active-user.decorator';
import { UserRole } from 'src/modules/auth/entities/user.entity';

import { ListUsersQueryDto } from './dto/list-users.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  public async list(userType: UserType, filter: ListUsersQueryDto) {
    const queryFilter = {
      cityId: userType.cityId,
      page: Number(filter.page),
      take: filter.take && Number(filter.take),
      roles: filter.roles,
      search: filter.search,
    };

    const usersPaginated = await this.userRepository.list(queryFilter);

    return usersPaginated;
  }

  public async changeRole(
    userId: string,
    role: UserRole,
    currentUser: UserType,
  ) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (currentUser.role === UserRole.OWNER) {
      if (user.role === UserRole.OWNER) {
        throw new BadRequestException('Owner cannot change other owner role');
      }

      user.role = role;
    }

    if (currentUser.role === UserRole.FINANCIAL) {
      if (user.role !== UserRole.RESIDENT || role !== UserRole.FINANCIAL) {
        throw new BadRequestException(
          'Financial cannot change other financial role',
        );
      }

      user.role = role;
    }

    if (currentUser.role === UserRole.MANAGER) {
      if (role !== UserRole.MANAGER) {
        throw new BadRequestException('Manager cannot change to this role');
      }
      user.role = role;
    }

    await this.userRepository.update(user);
  }

  public async getMe(userId: string) {
    const user = await this.userRepository.findMe(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }
}
