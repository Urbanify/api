import {
  Issue,
  IssueCategory,
  IssueStatus,
  Paginated,
} from '@modules/issue/entities/issue.entity';
import { Injectable } from '@nestjs/common';

import { IssueEntityToModelMapper } from './mappers/issue-entity-to-model.mapper';
import { CityModelToEntityMapper } from './mappers/issue-model-to-entity.mapper';
import { PrismaService } from '../../prisma.service';

type ListIssuesQueryFilter = {
  cityId: string;
  page: number;
  take?: number;
  start: Date;
  end: Date;
  status?: IssueStatus;
  category?: IssueCategory;
};

type ListIssuesReportedByUserQueryFilter = {
  cityId: string;
  reporterId: string;
  page: number;
  take?: number;
};

@Injectable()
export class IssueRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(issue: Issue): Promise<void> {
    const data = IssueEntityToModelMapper.map(issue);

    await this.prismaService.issue.create({
      data: {
        ...data,
        history: {
          createMany: {
            data: data.history,
          },
        },
        photos: {
          createMany: {
            data: data.photos,
          },
        },
      },
    });
  }

  public async list(
    queryFilter: ListIssuesQueryFilter,
  ): Promise<Paginated<Issue>> {
    const page = queryFilter.page;
    const take = queryFilter.take || 10;
    const skip = (page - 1) * take;

    const filter = {
      cityId: queryFilter.cityId,
      status: queryFilter.status && queryFilter.status,
      category: queryFilter.category && queryFilter.category,
      createdAt: {
        gte: queryFilter.start,
        lt: queryFilter.end,
      },
    };

    const issuesModel = await this.prismaService.issue.findMany({
      where: {
        ...filter,
      },
      take: take + 1,
      skip,
    });

    const hasNextPage = issuesModel.length > take;
    const hasPreviousPage = page > 1;

    if (hasNextPage) {
      issuesModel.pop();
    }

    const issues = issuesModel.map((issueModel) =>
      CityModelToEntityMapper.map(issueModel),
    );

    return {
      hasNextPage,
      hasPreviousPage,
      take,
      items: issues,
      currentPage: page,
    };
  }

  public async listWithManagerRelation(
    queryFilter: ListIssuesQueryFilter,
  ): Promise<Paginated<Issue>> {
    const page = queryFilter.page;
    const take = queryFilter.take || 10;
    const skip = (page - 1) * take;

    const filter = {
      cityId: queryFilter.cityId,
      status: queryFilter.status && queryFilter.status,
      category: queryFilter.category && queryFilter.category,
      createdAt: {
        gte: queryFilter.start,
        lt: queryFilter.end,
      },
    };

    const issuesModel = await this.prismaService.issue.findMany({
      where: {
        ...filter,
      },
      take: take + 1,
      skip,
      include: {
        manager: true,
      },
    });

    const hasNextPage = issuesModel.length > take;
    const hasPreviousPage = page > 1;

    if (hasNextPage) {
      issuesModel.pop();
    }

    const issues = issuesModel.map((issueModel) =>
      CityModelToEntityMapper.map(issueModel),
    );

    return {
      hasNextPage,
      hasPreviousPage,
      take,
      items: issues,
      currentPage: page,
    };
  }

  public async findById(id: string, cityId: string): Promise<Issue | null> {
    const issueModel = await this.prismaService.issue.findUnique({
      where: {
        id,
        cityId,
      },
      include: {
        history: true,
        photos: true,
      },
    });

    if (!issueModel) {
      return null;
    }

    return CityModelToEntityMapper.map(issueModel);
  }

  public async listReportedByUser(
    queryFilter: ListIssuesReportedByUserQueryFilter,
  ): Promise<Paginated<Issue>> {
    const page = queryFilter.page;
    const take = queryFilter.take || 10;
    const skip = (page - 1) * take;

    const filter = {
      cityId: queryFilter.cityId,
      reporterId: queryFilter.reporterId,
    };

    const issuesModel = await this.prismaService.issue.findMany({
      where: {
        ...filter,
      },
      take: take + 1,
      skip,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const hasNextPage = issuesModel.length > take;
    const hasPreviousPage = page > 1;

    if (hasNextPage) {
      issuesModel.pop();
    }

    const issues = issuesModel.map((issueModel) =>
      CityModelToEntityMapper.map(issueModel),
    );

    return {
      hasNextPage,
      hasPreviousPage,
      take,
      items: issues,
      currentPage: page,
    };
  }

  public async update(issue: Issue): Promise<void> {
    const data = IssueEntityToModelMapper.map(issue);

    const historyToCreatePromises = data.history.map((history) => {
      return this.prismaService.issueHistory.create({
        data: {
          id: history.id,
          userId: history.userId,
          issueId: issue.id,
          action: history.action,
          description: history.description,
          createdAt: history.createdAt,
          updatedAt: history.updatedAt,
        },
      });
    });

    const issueUpdatedPromise = this.prismaService.issue.update({
      where: {
        id: data.id,
      },
      data: {
        status: data.status,
        cityId: data.cityId,
        latitude: data.latitude,
        longitude: data.longitude,
        category: data.category,
        description: data.description,
        reporterId: data.reporterId,
        fiscalId: data.fiscalId,
        managerId: data.managerId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    });

    await Promise.all([...historyToCreatePromises, issueUpdatedPromise]);
  }

  // public async findByCpf(cpf: string): Promise<User | null> {
  //   const userModel = await this.prismaService.user.findUnique({
  //     where: {
  //       cpf,
  //     },
  //   });

  //   if (!userModel) {
  //     return null;
  //   }

  //   return UserModelToEntityMapper.map(userModel);
  // }

  // public async findByEmail(email: string): Promise<User | null> {
  //   const userModel = await this.prismaService.user.findUnique({
  //     where: {
  //       email,
  //     },
  //   });

  //   if (!userModel) {
  //     return null;
  //   }

  //   return UserModelToEntityMapper.map(userModel);
  // }

  // public async update(user: User): Promise<void> {
  //   const data = UserEntityToModelMapper.map(user);

  //   await this.prismaService.user.update({
  //     where: {
  //       id: data.id,
  //     },
  //     data,
  //   });
  // }
}
