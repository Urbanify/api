import { Injectable } from '@nestjs/common';
import {
  Paginated,
  User,
  UserRole,
} from 'src/modules/auth/entities/user.entity';

import { UserEntityToModelMapper } from './mappers/user-entity-to-model.mapper';
import { UserModelToEntityMapper } from './mappers/user-model-to-entity.mapper';
import { PrismaService } from '../../prisma.service';

type ListUsersRepositoryFilter = {
  cityId: string;
  page: number;
  take?: number;
  roles?: UserRole[];
  search?: string;
};

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(user: User): Promise<void> {
    const data = UserEntityToModelMapper.map(user);

    await this.prismaService.user.create({
      data,
    });
  }

  public async findById(id: string): Promise<User | null> {
    const userModel = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });

    if (!userModel) {
      return null;
    }

    return UserModelToEntityMapper.map(userModel);
  }

  public async findByCpf(cpf: string): Promise<User | null> {
    const userModel = await this.prismaService.user.findUnique({
      where: {
        cpf,
      },
    });

    if (!userModel) {
      return null;
    }

    return UserModelToEntityMapper.map(userModel);
  }

  public async findByEmail(email: string): Promise<User | null> {
    const userModel = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!userModel) {
      return null;
    }

    return UserModelToEntityMapper.map(userModel);
  }

  public async update(user: User): Promise<void> {
    const data = UserEntityToModelMapper.map(user);

    await this.prismaService.user.update({
      where: {
        id: data.id,
      },
      data,
    });
  }

  public async list(
    filter: ListUsersRepositoryFilter,
  ): Promise<Paginated<User>> {
    const page = filter.page;
    const take = filter.take || 10;
    const skip = (page - 1) * take;

    const where: any = {
      cityId: filter.cityId,
    };

    if (filter.roles && filter.roles.length > 0) {
      where.role = {
        in: filter.roles,
      };
    }

    if (filter.search) {
      const isCpf =
        /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(filter.search) ||
        /^\d{11}$/.test(filter.search);
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(filter.search);

      if (isCpf) {
        where.cpf = {
          contains: filter.search,
        };
      }
      if (isEmail) {
        where.email = {
          contains: filter.search,
          mode: 'insensitive',
        };
      }
      if (!isCpf && !isEmail) {
        where.OR = [
          {
            name: {
              contains: filter.search,
              mode: 'insensitive',
            },
          },
          {
            surname: {
              contains: filter.search,
              mode: 'insensitive',
            },
          },
        ];
      }
    }

    const usersModel = await this.prismaService.user.findMany({
      where,
      take: take + 1,
      skip,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const hasNextPage = usersModel.length > take;
    const hasPreviousPage = page > 1;

    if (hasNextPage) {
      usersModel.pop();
    }

    const users = usersModel.map((userModel) =>
      UserModelToEntityMapper.map(userModel),
    );

    return {
      hasNextPage,
      hasPreviousPage,
      take,
      items: users,
      currentPage: page,
    };
  }

  public async findMe(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        _count: {
          select: {
            issuesFiscal: true,
            issuesReported: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      name: user.name,
      surname: user.surname,
      email: user.email,
      cpf: user.cpf,
      createdAt: user.createdAt,
      fiscalOfIssuesCount: user._count.issuesFiscal,
      createdIssuesCount: user._count.issuesReported,
    };
  }
}
