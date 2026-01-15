import { IssueRepository } from '@infra/database/prisma/repositories/issue/issue.repository';
import { UserRole } from '@modules/auth/entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserType } from '@shared/decorators/active-user.decorator';

import { AcceptIssueDto } from './dto/accept-issue.dto';
import { AskNewSolutionDto } from './dto/ask-new-solution-issue.dto';
import { CloseIssueDto } from './dto/close-issue.dto';
import { CreateIssueDto } from './dto/create-issue.dto';
import { ListIssuesFilterDto } from './dto/list-issues.dto';
import { ResolutionIssueDto } from './dto/resolution-issue.dto';
import { SolveIssueDto } from './dto/solve-issue.dto';
import {
  Issue,
  IssueCategory,
  IssueHistoryAction,
  IssueStatus,
  IssueType,
  Paginated,
} from './entities/issue.entity';
import { IssueService } from './issue.service';

describe('IssueService', () => {
  let service: IssueService;
  let issueRepository: IssueRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IssueService,
        {
          provide: IssueRepository,
          useValue: {
            create: jest.fn().mockResolvedValue(null),
            list: jest.fn().mockResolvedValue(null),
            findById: jest.fn().mockResolvedValue(null),
            listReportedByUser: jest.fn().mockResolvedValue(null),
            update: jest.fn().mockResolvedValue(null),
            listWithManagerRelation: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    service = module.get<IssueService>(IssueService);
    issueRepository = module.get<IssueRepository>(IssueRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a issue', async () => {
      const createInput: CreateIssueDto = {
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        photos: ['myphoto'],
      };

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.ADMIN,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      await service.create(user, createInput);

      expect(issueRepository.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('list', () => {
    it('should list the issues from a city', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_FISCAL,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
        fiscalId: '5e5cae03-42db-4dc6-8e42-f739c62d346d',
        managerId: '07b089f6-169d-41ac-9ccd-2fcd3707aab3',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: '1210ec8b-0044-4aa7-a261-042307a5bc87',
            userId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
            userName: `Gustavo Bispo`,
            action: IssueHistoryAction.REPORTED_ISSUE,
            description: 'description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        photos: ['myphoto'],
      };

      const response: Paginated<Issue> = {
        items: [issue],
        hasNextPage: false,
        hasPreviousPage: false,
        currentPage: 1,
        take: 10,
      };

      jest.spyOn(issueRepository, 'list').mockResolvedValueOnce(response);

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.ADMIN,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const filter: ListIssuesFilterDto = {
        start: new Date('2024-06-28T07:09:38.503Z'),
        end: new Date('2025-03-17T03:50:16.606Z'),
        page: 1,
      };

      const output = await service.list(user, filter);

      expect(output).toBeDefined();
      expect(output).toEqual(response);
    });
  });

  describe('get by id', () => {
    it('should get an issue by id', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_FISCAL,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
        fiscalId: '5e5cae03-42db-4dc6-8e42-f739c62d346d',
        managerId: '07b089f6-169d-41ac-9ccd-2fcd3707aab3',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: '1210ec8b-0044-4aa7-a261-042307a5bc87',
            userId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
            userName: `Gustavo Bispo`,
            action: IssueHistoryAction.REPORTED_ISSUE,
            description: 'description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        photos: ['myphoto'],
      };

      jest.spyOn(issueRepository, 'findById').mockResolvedValueOnce(issue);

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.ADMIN,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const output = await service.getById(issue.id, user.cityId);

      expect(output).toBeDefined();
      expect(output).toEqual(issue);
    });

    it('should throw a not found exception when issue not found', async () => {
      const id = 'id';

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.ADMIN,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const notFoundException = new NotFoundException(`issue ${id} not found`);

      expect(service.getById(id, user.id)).rejects.toEqual(notFoundException);
    });
  });

  describe('list reported by user', () => {
    it('should list the issues reported by user', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_FISCAL,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
        fiscalId: '5e5cae03-42db-4dc6-8e42-f739c62d346d',
        managerId: '07b089f6-169d-41ac-9ccd-2fcd3707aab3',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: '1210ec8b-0044-4aa7-a261-042307a5bc87',
            userId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
            userName: `Gustavo Bispo`,
            action: IssueHistoryAction.REPORTED_ISSUE,
            description: 'description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        photos: ['myphoto'],
      };

      const response: Paginated<Issue> = {
        items: [issue],
        hasNextPage: false,
        hasPreviousPage: false,
        currentPage: 1,
        take: 10,
      };

      jest
        .spyOn(issueRepository, 'listReportedByUser')
        .mockResolvedValueOnce(response);

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.ADMIN,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const filter: ListIssuesFilterDto = {
        start: new Date('2024-06-28T07:09:38.503Z'),
        end: new Date('2025-03-17T03:50:16.606Z'),
        page: 1,
      };

      const output = await service.listReportedByUser(user, filter);

      expect(output).toBeDefined();
      expect(output).toEqual(response);
    });
  });

  describe('assign', () => {
    it('should assign a resident user to issue', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_FISCAL,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
        fiscalId: '',
        managerId: '07b089f6-169d-41ac-9ccd-2fcd3707aab3',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: '1210ec8b-0044-4aa7-a261-042307a5bc87',
            userId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
            userName: `Gustavo Bispo`,
            action: IssueHistoryAction.REPORTED_ISSUE,
            description: 'description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        photos: ['myphoto'],
      };

      jest.spyOn(issueRepository, 'findById').mockResolvedValueOnce(issue);

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.RESIDENT,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      await service.assign(issue.id, user);

      expect(issueRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should assign a manager user to issue', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_MANAGER,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
        fiscalId: '07b089f6-169d-41ac-9ccd-2fcd3707aab3',
        managerId: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: '1210ec8b-0044-4aa7-a261-042307a5bc87',
            userId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
            userName: `Gustavo Bispo`,
            action: IssueHistoryAction.REPORTED_ISSUE,
            description: 'description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        photos: ['myphoto'],
      };

      jest.spyOn(issueRepository, 'findById').mockResolvedValueOnce(issue);

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.MANAGER,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      await service.assign(issue.id, user);

      expect(issueRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should throw a not found exception when issue not found', async () => {
      const id = 'id';

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.ADMIN,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const notFoundException = new NotFoundException(`issue ${id} not found`);

      expect(service.assign(id, user)).rejects.toEqual(notFoundException);
    });

    it('should throw a bad request exception when issue status is not WAITING_FOR_FISCAL', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_MANAGER,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
        fiscalId: '',
        managerId: '07b089f6-169d-41ac-9ccd-2fcd3707aab3',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: '1210ec8b-0044-4aa7-a261-042307a5bc87',
            userId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
            userName: `Gustavo Bispo`,
            action: IssueHistoryAction.REPORTED_ISSUE,
            description: 'description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        photos: ['myphoto'],
      };

      jest.spyOn(issueRepository, 'findById').mockResolvedValueOnce(issue);

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.RESIDENT,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const badRequestException = new BadRequestException(
        `could not assign user ${user.id} because status is not ${IssueStatus.WAITING_FOR_FISCAL}`,
      );

      expect(service.assign(issue.id, user)).rejects.toEqual(
        badRequestException,
      );
    });

    it('should throw a bad request exception when issue already has a fiscal', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_FISCAL,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
        fiscalId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
        managerId: '07b089f6-169d-41ac-9ccd-2fcd3707aab3',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: '1210ec8b-0044-4aa7-a261-042307a5bc87',
            userId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
            userName: `Gustavo Bispo`,
            action: IssueHistoryAction.REPORTED_ISSUE,
            description: 'description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        photos: ['myphoto'],
      };

      jest.spyOn(issueRepository, 'findById').mockResolvedValueOnce(issue);

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.RESIDENT,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const badRequestException = new BadRequestException(
        `this issue already has a fiscal`,
      );

      expect(service.assign(issue.id, user)).rejects.toEqual(
        badRequestException,
      );
    });

    it('should throw a bad request exception when issue status is not WAITING_FOR_MANAGER', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_FISCAL,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
        fiscalId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
        managerId: '07b089f6-169d-41ac-9ccd-2fcd3707aab3',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: '1210ec8b-0044-4aa7-a261-042307a5bc87',
            userId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
            userName: `Gustavo Bispo`,
            action: IssueHistoryAction.REPORTED_ISSUE,
            description: 'description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        photos: ['myphoto'],
      };

      jest.spyOn(issueRepository, 'findById').mockResolvedValueOnce(issue);

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.MANAGER,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const badRequestException = new BadRequestException(
        `could not assign user ${user.id} because status is not ${IssueStatus.WAITING_FOR_MANAGER}`,
      );

      expect(service.assign(issue.id, user)).rejects.toEqual(
        badRequestException,
      );
    });

    it('should throw a bad request exception when issue already has a manager', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_MANAGER,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
        fiscalId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
        managerId: '07b089f6-169d-41ac-9ccd-2fcd3707aab3',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: '1210ec8b-0044-4aa7-a261-042307a5bc87',
            userId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
            userName: `Gustavo Bispo`,
            action: IssueHistoryAction.REPORTED_ISSUE,
            description: 'description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        photos: ['myphoto'],
      };

      jest.spyOn(issueRepository, 'findById').mockResolvedValueOnce(issue);

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.MANAGER,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const badRequestException = new BadRequestException(
        `this issue already has a manager`,
      );

      expect(service.assign(issue.id, user)).rejects.toEqual(
        badRequestException,
      );
    });
  });

  describe('close', () => {
    it('should close an issue when user is fiscal', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_PROCEDURE,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
        fiscalId: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        managerId: '07b089f6-169d-41ac-9ccd-2fcd3707aab3',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: '1210ec8b-0044-4aa7-a261-042307a5bc87',
            userId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
            userName: `Gustavo Bispo`,
            action: IssueHistoryAction.REPORTED_ISSUE,
            description: 'description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        photos: ['myphoto'],
      };

      jest.spyOn(issueRepository, 'findById').mockResolvedValueOnce(issue);

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.RESIDENT,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const closeIssueDto: CloseIssueDto = {
        description: 'description',
      };

      await service.close(issue.id, closeIssueDto, user);

      expect(issueRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should close an issue when user is manager', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_PROCEDURE,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
        fiscalId: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        managerId: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: '1210ec8b-0044-4aa7-a261-042307a5bc87',
            userId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
            userName: `Gustavo Bispo`,
            action: IssueHistoryAction.REPORTED_ISSUE,
            description: 'description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        photos: ['myphoto'],
      };

      jest.spyOn(issueRepository, 'findById').mockResolvedValueOnce(issue);

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.MANAGER,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const closeIssueDto: CloseIssueDto = {
        description: 'description',
      };

      await service.close(issue.id, closeIssueDto, user);

      expect(issueRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should throw a not found exception when issue not found', async () => {
      const id = 'id';

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.ADMIN,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const notFoundException = new NotFoundException(`issue ${id} not found`);

      const closeIssueDto: CloseIssueDto = {
        description: 'description',
      };

      expect(service.close(id, closeIssueDto, user)).rejects.toEqual(
        notFoundException,
      );
    });

    it('should throw a bad request exception when issue status is not WAITING_FOR_PROCEDURE', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.CLOSED,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
        fiscalId: '',
        managerId: '07b089f6-169d-41ac-9ccd-2fcd3707aab3',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: '1210ec8b-0044-4aa7-a261-042307a5bc87',
            userId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
            userName: `Gustavo Bispo`,
            action: IssueHistoryAction.REPORTED_ISSUE,
            description: 'description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        photos: ['myphoto'],
      };

      jest.spyOn(issueRepository, 'findById').mockResolvedValueOnce(issue);

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.RESIDENT,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const badRequestException = new BadRequestException(
        `could not close issue ${issue.id} because status is not ${IssueStatus.WAITING_FOR_PROCEDURE} or ${IssueStatus.WAITING_FOR_FISCAL}`,
      );

      const closeIssueDto: CloseIssueDto = {
        description: 'description',
      };

      expect(service.close(issue.id, closeIssueDto, user)).rejects.toEqual(
        badRequestException,
      );
    });

    it('should throw a bad request exception when user RESIDENT is not assigned to issue', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_PROCEDURE,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
        fiscalId: '',
        managerId: '07b089f6-169d-41ac-9ccd-2fcd3707aab3',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: '1210ec8b-0044-4aa7-a261-042307a5bc87',
            userId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
            userName: `Gustavo Bispo`,
            action: IssueHistoryAction.REPORTED_ISSUE,
            description: 'description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        photos: ['myphoto'],
      };

      jest.spyOn(issueRepository, 'findById').mockResolvedValueOnce(issue);

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.RESIDENT,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const badRequestException = new BadRequestException(
        `could not close issue because user ${user.id} not assigned`,
      );

      const closeIssueDto: CloseIssueDto = {
        description: 'description',
      };

      expect(service.close(issue.id, closeIssueDto, user)).rejects.toEqual(
        badRequestException,
      );
    });

    it('should throw a bad request exception when user MANAGER is not assigned to issue', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_PROCEDURE,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
        fiscalId: '',
        managerId: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: '1210ec8b-0044-4aa7-a261-042307a5bc87',
            userId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
            userName: `Gustavo Bispo`,
            action: IssueHistoryAction.REPORTED_ISSUE,
            description: 'description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        photos: ['myphoto'],
      };

      jest.spyOn(issueRepository, 'findById').mockResolvedValueOnce(issue);

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.MANAGER,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const badRequestException = new BadRequestException(
        `could not close issue because user ${user.id} not assigned`,
      );

      const closeIssueDto: CloseIssueDto = {
        description: 'description',
      };

      expect(service.close(issue.id, closeIssueDto, user)).rejects.toEqual(
        badRequestException,
      );
    });
  });

  describe('accept', () => {
    it('should accept an issue', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_PROCEDURE,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
        fiscalId: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        managerId: '07b089f6-169d-41ac-9ccd-2fcd3707aab3',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: '1210ec8b-0044-4aa7-a261-042307a5bc87',
            userId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
            userName: `Gustavo Bispo`,
            action: IssueHistoryAction.REPORTED_ISSUE,
            description: 'description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        photos: ['myphoto'],
      };

      jest.spyOn(issueRepository, 'findById').mockResolvedValueOnce(issue);

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.RESIDENT,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const acceptIssueDto: AcceptIssueDto = {
        description: 'description',
      };

      await service.accept(issue.id, acceptIssueDto, user);

      expect(issueRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should throw a not found exception when issue not found', async () => {
      const id = 'id';

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.ADMIN,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const notFoundException = new NotFoundException(`issue ${id} not found`);

      const acceptIssueDto: AcceptIssueDto = {
        description: 'description',
      };

      expect(service.accept(id, acceptIssueDto, user)).rejects.toEqual(
        notFoundException,
      );
    });

    it('should throw a bad request exception when issue status is not WAITING_FOR_PROCEDURE', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_FISCAL,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
        fiscalId: '',
        managerId: '07b089f6-169d-41ac-9ccd-2fcd3707aab3',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: '1210ec8b-0044-4aa7-a261-042307a5bc87',
            userId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
            userName: `Gustavo Bispo`,
            action: IssueHistoryAction.REPORTED_ISSUE,
            description: 'description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        photos: ['myphoto'],
      };

      jest.spyOn(issueRepository, 'findById').mockResolvedValueOnce(issue);

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.RESIDENT,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const badRequestException = new BadRequestException(
        `could not close issue ${issue.id} because status is not ${IssueStatus.WAITING_FOR_PROCEDURE}`,
      );

      const acceptIssueDto: AcceptIssueDto = {
        description: 'description',
      };

      expect(service.accept(issue.id, acceptIssueDto, user)).rejects.toEqual(
        badRequestException,
      );
    });

    it('should throw a bad request exception when user RESIDENT is not assigned to issue', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_PROCEDURE,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
        fiscalId: '',
        managerId: '07b089f6-169d-41ac-9ccd-2fcd3707aab3',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: '1210ec8b-0044-4aa7-a261-042307a5bc87',
            userId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
            userName: `Gustavo Bispo`,
            action: IssueHistoryAction.REPORTED_ISSUE,
            description: 'description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        photos: ['myphoto'],
      };

      jest.spyOn(issueRepository, 'findById').mockResolvedValueOnce(issue);

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.RESIDENT,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const badRequestException = new BadRequestException(
        `could not accept issue because user ${user.id} not assigned`,
      );

      const acceptIssueDto: AcceptIssueDto = {
        description: 'description',
      };

      expect(service.accept(issue.id, acceptIssueDto, user)).rejects.toEqual(
        badRequestException,
      );
    });
  });

  describe('solve', () => {
    it('should solve an issue when user is RESIDENT', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_RESOLUTION_VALIDATION,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
        fiscalId: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        managerId: '07b089f6-169d-41ac-9ccd-2fcd3707aab3',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: '1210ec8b-0044-4aa7-a261-042307a5bc87',
            userId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
            userName: `Gustavo Bispo`,
            action: IssueHistoryAction.REPORTED_ISSUE,
            description: 'description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        photos: ['myphoto'],
      };

      jest.spyOn(issueRepository, 'findById').mockResolvedValueOnce(issue);

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.RESIDENT,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const solveIssueDto: SolveIssueDto = {
        description: 'description',
      };

      await service.solve(issue.id, solveIssueDto, user);

      expect(issueRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should solve an issue when user is MANAGER', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_RESOLUTION_VALIDATION,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
        fiscalId: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        managerId: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: '1210ec8b-0044-4aa7-a261-042307a5bc87',
            userId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
            userName: `Gustavo Bispo`,
            action: IssueHistoryAction.REPORTED_ISSUE,
            description: 'description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        photos: ['myphoto'],
      };

      jest.spyOn(issueRepository, 'findById').mockResolvedValueOnce(issue);

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.MANAGER,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const solveIssueDto: SolveIssueDto = {
        description: 'description',
      };

      await service.solve(issue.id, solveIssueDto, user);

      expect(issueRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should throw a not found exception when issue not found', async () => {
      const id = 'id';

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.ADMIN,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const notFoundException = new NotFoundException(`issue ${id} not found`);

      const solveIssueDto: SolveIssueDto = {
        description: 'description',
      };

      expect(service.solve(id, solveIssueDto, user)).rejects.toEqual(
        notFoundException,
      );
    });

    it('should throw a bad request exception when issue status is not WAITING_FOR_RESOLUTION_VALIDATION', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_FISCAL,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        fiscalId: '',
        managerId: '07b089f6-169d-41ac-9ccd-2fcd3707aab3',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: '1210ec8b-0044-4aa7-a261-042307a5bc87',
            userId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
            userName: `Gustavo Bispo`,
            action: IssueHistoryAction.REPORTED_ISSUE,
            description: 'description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        photos: ['myphoto'],
      };

      jest.spyOn(issueRepository, 'findById').mockResolvedValueOnce(issue);

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.RESIDENT,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const badRequestException = new BadRequestException(
        `could not solve issue ${issue.id} because status is not ${IssueStatus.WAITING_FOR_RESOLUTION_VALIDATION}`,
      );

      const solveIssueDto: SolveIssueDto = {
        description: 'description',
      };

      expect(service.solve(issue.id, solveIssueDto, user)).rejects.toEqual(
        badRequestException,
      );
    });

    it('should throw a bad request exception when user RESIDENT is not assigned to issue', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_RESOLUTION_VALIDATION,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: '',
        fiscalId: '',
        managerId: '07b089f6-169d-41ac-9ccd-2fcd3707aab3',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: '1210ec8b-0044-4aa7-a261-042307a5bc87',
            userId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
            userName: `Gustavo Bispo`,
            action: IssueHistoryAction.REPORTED_ISSUE,
            description: 'description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        photos: ['myphoto'],
      };

      jest.spyOn(issueRepository, 'findById').mockResolvedValueOnce(issue);

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.RESIDENT,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const badRequestException = new BadRequestException(
        `could not solve issue because user ${user.id} not assigned`,
      );

      const solveIssueDto: SolveIssueDto = {
        description: 'description',
      };

      expect(service.solve(issue.id, solveIssueDto, user)).rejects.toEqual(
        badRequestException,
      );
    });

    it('should throw a bad request exception when user MANAGER is not assigned to issue', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_RESOLUTION_VALIDATION,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: '',
        fiscalId: '',
        managerId: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: '1210ec8b-0044-4aa7-a261-042307a5bc87',
            userId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
            userName: `Gustavo Bispo`,
            action: IssueHistoryAction.REPORTED_ISSUE,
            description: 'description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        photos: ['myphoto'],
      };

      jest.spyOn(issueRepository, 'findById').mockResolvedValueOnce(issue);

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.MANAGER,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const badRequestException = new BadRequestException(
        `could not solve issue because user ${user.id} not assigned`,
      );

      const solveIssueDto: SolveIssueDto = {
        description: 'description',
      };

      expect(service.solve(issue.id, solveIssueDto, user)).rejects.toEqual(
        badRequestException,
      );
    });
  });

  describe('resolution', () => {
    it('should add a resolution to issue', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_MANAGER_RESOLUTION,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
        fiscalId: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        managerId: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: '1210ec8b-0044-4aa7-a261-042307a5bc87',
            userId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
            userName: `Gustavo Bispo`,
            action: IssueHistoryAction.REPORTED_ISSUE,
            description: 'description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        photos: ['myphoto'],
      };

      jest.spyOn(issueRepository, 'findById').mockResolvedValueOnce(issue);

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.MANAGER,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const resolutionIssueDto: ResolutionIssueDto = {
        description: 'description',
      };

      await service.resolution(issue.id, resolutionIssueDto, user);

      expect(issueRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should throw a not found exception when issue not found', async () => {
      const id = 'id';

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.ADMIN,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const notFoundException = new NotFoundException(`issue ${id} not found`);

      const resolutionIssueDto: ResolutionIssueDto = {
        description: 'description',
      };

      expect(service.resolution(id, resolutionIssueDto, user)).rejects.toEqual(
        notFoundException,
      );
    });

    it('should throw a bad request exception when issue status is not WAITING_FOR_MANAGER_RESOLUTION', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_FISCAL,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        fiscalId: '',
        managerId: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: '1210ec8b-0044-4aa7-a261-042307a5bc87',
            userId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
            userName: `Gustavo Bispo`,
            action: IssueHistoryAction.REPORTED_ISSUE,
            description: 'description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        photos: ['myphoto'],
      };

      jest.spyOn(issueRepository, 'findById').mockResolvedValueOnce(issue);

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.MANAGER,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const badRequestException = new BadRequestException(
        `could not solve issue ${issue.id} because status is not ${IssueStatus.WAITING_FOR_MANAGER_RESOLUTION}`,
      );

      const resolutionIssueDto: ResolutionIssueDto = {
        description: 'description',
      };

      expect(
        service.resolution(issue.id, resolutionIssueDto, user),
      ).rejects.toEqual(badRequestException);
    });

    it('should throw a bad request exception when user MANAGER is not assigned to issue', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_MANAGER_RESOLUTION,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: '',
        fiscalId: '',
        managerId: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: '1210ec8b-0044-4aa7-a261-042307a5bc87',
            userId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
            userName: `Gustavo Bispo`,
            action: IssueHistoryAction.REPORTED_ISSUE,
            description: 'description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        photos: ['myphoto'],
      };

      jest.spyOn(issueRepository, 'findById').mockResolvedValueOnce(issue);

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.MANAGER,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const badRequestException = new BadRequestException(
        `could not solve issue because user ${user.id} not assigned`,
      );

      const resolutionIssueDto: ResolutionIssueDto = {
        description: 'description',
      };

      expect(
        service.resolution(issue.id, resolutionIssueDto, user),
      ).rejects.toEqual(badRequestException);
    });
  });

  describe('askNewSolution', () => {
    it('should ask for a new solution when user is reporter', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_RESOLUTION_VALIDATION,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
        fiscalId: '5e5cae03-42db-4dc6-8e42-f739c62d346d',
        managerId: '07b089f6-169d-41ac-9ccd-2fcd3707aab3',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [],
        photos: ['myphoto'],
      };

      jest.spyOn(issueRepository, 'findById').mockResolvedValueOnce(issue);

      const user: UserType = {
        id: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
        name: 'John',
        surname: 'Doe',
        role: UserRole.RESIDENT,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const dto: AskNewSolutionDto = {
        description: 'Still broken',
      };

      await service.askNewSolution(issue.id, dto, user);

      expect(issueRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should ask for a new solution when user is fiscal', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_RESOLUTION_VALIDATION,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
        fiscalId: '5e5cae03-42db-4dc6-8e42-f739c62d346d',
        managerId: '07b089f6-169d-41ac-9ccd-2fcd3707aab3',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [],
        photos: ['myphoto'],
      };

      jest.spyOn(issueRepository, 'findById').mockResolvedValueOnce(issue);

      const user: UserType = {
        id: '5e5cae03-42db-4dc6-8e42-f739c62d346d',
        name: 'Fiscal',
        surname: 'User',
        role: UserRole.RESIDENT,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const dto: AskNewSolutionDto = {
        description: 'Still broken',
      };

      await service.askNewSolution(issue.id, dto, user);

      expect(issueRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException if status is not WAITING_FOR_RESOLUTION_VALIDATION', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.SOLVED,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: 'rep-id',
        fiscalId: 'fis-id',
        managerId: 'man-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [],
        photos: [],
      };

      jest.spyOn(issueRepository, 'findById').mockResolvedValueOnce(issue);

      const user: UserType = {
        id: 'rep-id',
        name: 'John',
        surname: 'Doe',
        role: UserRole.RESIDENT,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const dto: AskNewSolutionDto = { description: 'desc' };

      await expect(service.askNewSolution(issue.id, dto, user)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if user is not reporter or fiscal', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_RESOLUTION_VALIDATION,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: 'rep-id',
        fiscalId: 'fis-id',
        managerId: 'man-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [],
        photos: [],
      };

      jest.spyOn(issueRepository, 'findById').mockResolvedValueOnce(issue);

      const user: UserType = {
        id: 'other-id',
        name: 'Other',
        surname: 'User',
        role: UserRole.RESIDENT,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const dto: AskNewSolutionDto = { description: 'desc' };

      await expect(service.askNewSolution(issue.id, dto, user)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('list open issues', () => {
    it('should list the issues from a city', async () => {
      const issue: Issue = {
        id: '913a1ddb-9582-446e-a62b-0ec56bbf1cb8',
        status: IssueStatus.WAITING_FOR_FISCAL,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        latitude: 'latitude',
        longitude: 'longitude',
        category: IssueCategory.INFRASTRUCTURE,
        type: IssueType.ABANDONED_CONSTRUCTION,
        description: 'description',
        reporterId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
        fiscalId: '5e5cae03-42db-4dc6-8e42-f739c62d346d',
        managerId: '07b089f6-169d-41ac-9ccd-2fcd3707aab3',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: '1210ec8b-0044-4aa7-a261-042307a5bc87',
            userId: 'adacd030-c54c-49a1-a1bd-63fc0f32a4e1',
            userName: `Gustavo Bispo`,
            action: IssueHistoryAction.REPORTED_ISSUE,
            description: 'description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        photos: ['myphoto'],
      };

      const response: Paginated<Issue> = {
        items: [issue],
        hasNextPage: false,
        hasPreviousPage: false,
        currentPage: 1,
        take: 10,
      };

      jest
        .spyOn(issueRepository, 'listWithManagerRelation')
        .mockResolvedValueOnce(response);

      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.ADMIN,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const filter: ListIssuesFilterDto = {
        start: new Date('2024-06-28T07:09:38.503Z'),
        end: new Date('2025-03-17T03:50:16.606Z'),
        page: 1,
      };

      const output = await service.listOpenIssues(user, filter);

      expect(output).toBeDefined();
      expect(output).toEqual(response);
    });
  });
});
