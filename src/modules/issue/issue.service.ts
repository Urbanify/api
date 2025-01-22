import { IssueRepository } from '@infra/database/prisma/repositories/issue/issue.repository';
import { UserRole } from '@modules/auth/entities/user.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserType } from '@shared/decorators/active-user.decorator';
import { UUIDGenerator } from '@shared/uuid-generator';

import { AcceptIssueDto } from './dto/accept-issue.dto';
import { CloseIssueDto } from './dto/close-issue.dto';
import { CreateIssueDto } from './dto/create-issue.dto';
import { ListIssuesFilterDto } from './dto/list-issues.dto';
import { ListIssuesReportedByUserFilterDto } from './dto/list-issues-reported-by-user.dto';
import { ResolutionIssueDto } from './dto/resolution-issue.dto';
import { SolveIssueDto } from './dto/solve-issue.dto';
import { IssueHistoryAction, IssueStatus } from './entities/issue.entity';

@Injectable()
export class IssueService {
  constructor(private readonly issueRepository: IssueRepository) {}

  public async create(userType: UserType, createIssueDto: CreateIssueDto) {
    await this.issueRepository.create({
      id: UUIDGenerator.generate(),
      status: IssueStatus.WAITING_FOR_FISCAL,
      cityId: userType.cityId,
      latitude: createIssueDto.latitude,
      longitude: createIssueDto.longitude,
      category: createIssueDto.category,
      type: createIssueDto.type,
      description: createIssueDto.description,
      reporterId: userType.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      history: [
        {
          id: UUIDGenerator.generate(),
          userId: userType.id,
          userName: `${userType.name} ${userType.surname}`,
          action: IssueHistoryAction.REPORTED_ISSUE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      photos: createIssueDto.photos,
    });
  }

  public async list(userType: UserType, filter: ListIssuesFilterDto) {
    const queryFilter = {
      cityId: userType.cityId,
      page: Number(filter.page),
      take: filter.take && Number(filter.take),
      start: filter.start,
      end: filter.end,
      status: filter.status,
      category: filter.category,
    };

    const issuesPaginated = await this.issueRepository.list(queryFilter);

    return issuesPaginated;
  }

  public async getById(id: string, cityId: string) {
    const issue = await this.issueRepository.findById(id, cityId);

    if (!issue) {
      throw new NotFoundException(`issue ${id} not found`);
    }

    return issue;
  }

  public async listReportedByUser(
    userType: UserType,
    filter: ListIssuesReportedByUserFilterDto,
  ) {
    const queryFilter = {
      cityId: userType.cityId,
      page: Number(filter.page),
      take: filter.take && Number(filter.take),
      reporterId: userType.id,
    };

    const issuesPaginated =
      await this.issueRepository.listReportedByUser(queryFilter);

    return issuesPaginated;
  }

  public async assign(id: string, userType: UserType) {
    const userId = userType.id;
    const userRole = userType.role;

    const issue = await this.issueRepository.findById(id, userType.cityId);

    if (!issue) {
      throw new NotFoundException(`issue ${id} not found`);
    }

    issue.history = [];

    if (userRole === UserRole.RESIDENT) {
      if (issue.status !== IssueStatus.WAITING_FOR_FISCAL) {
        throw new BadRequestException(
          `could not assign user ${userId} because status is not ${IssueStatus.WAITING_FOR_FISCAL}`,
        );
      }

      if (issue.fiscalId) {
        throw new BadRequestException(`this issue already has a fiscal`);
      }

      issue.fiscalId = userId;
      issue.status = IssueStatus.WAITING_FOR_PROCEDURE;
      issue.history.push({
        id: UUIDGenerator.generate(),
        userId: userId,
        userName: `${userType.name} ${userType.surname}`,
        action: IssueHistoryAction.ASSIGNED_AS_FISCAL,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    if (userRole === UserRole.MANAGER) {
      if (issue.status !== IssueStatus.WAITING_FOR_MANAGER) {
        throw new BadRequestException(
          `could not assign user ${userId} because status is not ${IssueStatus.WAITING_FOR_MANAGER}`,
        );
      }

      if (issue.managerId) {
        throw new BadRequestException(`this issue already has a manager`);
      }

      issue.managerId = userId;
      issue.status = IssueStatus.WAITING_FOR_MANAGER_RESOLUTION;
      issue.history.push({
        id: UUIDGenerator.generate(),
        userId: userId,
        userName: `${userType.name} ${userType.surname}`,
        action: IssueHistoryAction.ASSIGNED_AS_MANAGER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await this.issueRepository.update(issue);
  }

  public async close(
    id: string,
    closeIssueDto: CloseIssueDto,
    userType: UserType,
  ) {
    const issue = await this.issueRepository.findById(id, userType.cityId);

    if (!issue) {
      throw new NotFoundException(`issue ${id} not found`);
    }

    if (issue.status !== IssueStatus.WAITING_FOR_PROCEDURE) {
      throw new BadRequestException(
        `could not close issue ${id} because status is not ${IssueStatus.WAITING_FOR_PROCEDURE}`,
      );
    }

    const userRole = userType.role;
    const userId = userType.id;

    if (userRole === UserRole.RESIDENT) {
      if (issue.fiscalId !== userId) {
        throw new BadRequestException(
          `could not close issue because user ${userId} not assigned`,
        );
      }
    }

    if (userRole === UserRole.MANAGER || userRole === UserRole.OWNER) {
      if (issue.managerId !== userId) {
        throw new BadRequestException(
          `could not close issue because user ${userId} not assigned`,
        );
      }
    }

    issue.history = [];
    issue.status = IssueStatus.CLOSED;
    issue.history.push({
      id: UUIDGenerator.generate(),
      userId: userType.id,
      userName: `${userType.name} ${userType.surname}`,
      action: IssueHistoryAction.MARKED_AS_UNFOUNDED,
      description: closeIssueDto.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.issueRepository.update(issue);
  }

  public async accept(
    id: string,
    acceptIssueDto: AcceptIssueDto,
    userType: UserType,
  ) {
    const issue = await this.issueRepository.findById(id, userType.cityId);

    if (!issue) {
      throw new NotFoundException(`issue ${id} not found`);
    }

    if (issue.status !== IssueStatus.WAITING_FOR_PROCEDURE) {
      throw new BadRequestException(
        `could not close issue ${id} because status is not ${IssueStatus.WAITING_FOR_PROCEDURE}`,
      );
    }

    const userId = userType.id;

    if (issue.fiscalId !== userId) {
      throw new BadRequestException(
        `could not accept issue because user ${userId} not assigned`,
      );
    }

    issue.history = [];
    issue.status = IssueStatus.WAITING_FOR_MANAGER;
    issue.history.push({
      id: UUIDGenerator.generate(),
      userId: userType.id,
      userName: `${userType.name} ${userType.surname}`,
      action: IssueHistoryAction.MARKED_AS_VALID,
      description: acceptIssueDto.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.issueRepository.update(issue);
  }

  public async resolution(
    id: string,
    resolutionIssueDto: ResolutionIssueDto,
    userType: UserType,
  ) {
    const issue = await this.issueRepository.findById(id, userType.cityId);

    if (!issue) {
      throw new NotFoundException(`issue ${id} not found`);
    }

    if (issue.status !== IssueStatus.WAITING_FOR_MANAGER_RESOLUTION) {
      throw new BadRequestException(
        `could not solve issue ${id} because status is not ${IssueStatus.WAITING_FOR_MANAGER_RESOLUTION}`,
      );
    }

    const userId = userType.id;

    if (issue.managerId !== userId) {
      throw new BadRequestException(
        `could not solve issue because user ${userId} not assigned`,
      );
    }

    issue.history = [];
    issue.status = IssueStatus.WAITING_FOR_RESOLUTION_VALIDATION;
    issue.history.push({
      id: UUIDGenerator.generate(),
      userId: userType.id,
      userName: `${userType.name} ${userType.surname}`,
      action: IssueHistoryAction.ADDED_RESOLUTION,
      description: resolutionIssueDto.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.issueRepository.update(issue);
  }

  public async solve(
    id: string,
    solveIssueDto: SolveIssueDto,
    userType: UserType,
  ) {
    const issue = await this.issueRepository.findById(id, userType.cityId);

    if (!issue) {
      throw new NotFoundException(`issue ${id} not found`);
    }

    if (issue.status !== IssueStatus.WAITING_FOR_RESOLUTION_VALIDATION) {
      throw new BadRequestException(
        `could not solve issue ${id} because status is not ${IssueStatus.WAITING_FOR_RESOLUTION_VALIDATION}`,
      );
    }

    const userRole = userType.role;
    const userId = userType.id;

    if (userRole === UserRole.RESIDENT) {
      if (issue.fiscalId !== userId && issue.reporterId !== userId) {
        throw new BadRequestException(
          `could not solve issue because user ${userId} not assigned`,
        );
      }
    }

    if (userRole === UserRole.MANAGER || userRole === UserRole.OWNER) {
      if (issue.managerId !== userId) {
        throw new BadRequestException(
          `could not solve issue because user ${userId} not assigned`,
        );
      }
    }

    issue.history = [];
    issue.status = IssueStatus.SOLVED;
    issue.history.push({
      id: UUIDGenerator.generate(),
      userId: userType.id,
      userName: `${userType.name} ${userType.surname}`,
      action: IssueHistoryAction.MARKED_AS_SOLVED,
      description: solveIssueDto.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.issueRepository.update(issue);
  }

  public async listOpenIssues(userType: UserType, filter: ListIssuesFilterDto) {
    const queryFilter = {
      cityId: userType.cityId,
      page: Number(filter.page),
      take: filter.take && Number(filter.take),
      start: filter.start,
      end: filter.end,
      status: filter.status,
      category: filter.category,
    };

    const issuesPaginated =
      await this.issueRepository.listWithManagerRelation(queryFilter);

    return issuesPaginated;
  }
}
