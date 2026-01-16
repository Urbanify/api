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

    if (currentUser.role !== UserRole.ADMIN && user.role === UserRole.ADMIN) {
      throw new BadRequestException('Only admin can change admin role');
    }

    if (currentUser.role === UserRole.ADMIN) {
      user.role = role;
      await this.userRepository.update(user);
      return;
    }

    if (currentUser.role === UserRole.OWNER) {
      if (user.role === UserRole.OWNER) {
        if (role !== UserRole.OWNER) {
          throw new BadRequestException('Owner cannot remove other owner role');
        }
      }

      if (
        role !== UserRole.OWNER &&
        role !== UserRole.MANAGER &&
        role !== UserRole.FINANCIAL &&
        role !== UserRole.RESIDENT
      ) {
        throw new BadRequestException('Owner cannot change to this role');
      }

      user.role = role;
      await this.userRepository.update(user);
      return;
    }

    if (currentUser.role === UserRole.FINANCIAL) {
      if (role !== UserRole.FINANCIAL) {
        throw new BadRequestException('Financial cannot change to this role');
      }

      if (user.role !== UserRole.RESIDENT && user.role !== UserRole.FINANCIAL) {
        throw new BadRequestException('Financial cannot change other role');
      }

      user.role = role;
      await this.userRepository.update(user);
      return;
    }

    if (currentUser.role === UserRole.MANAGER) {
      if (role === UserRole.MANAGER) {
        user.role = role;
        await this.userRepository.update(user);
        return;
      }

      if (role === UserRole.RESIDENT) {
        if (user.role !== UserRole.MANAGER) {
          throw new BadRequestException('Manager can only remove manager role');
        }
        user.role = role;
        await this.userRepository.update(user);
        return;
      }

      throw new BadRequestException('Manager cannot change to this role');
    }

    throw new BadRequestException('Role change not allowed');
  }

  public async getMe(userId: string) {
    const user = await this.userRepository.findMe(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }
}
