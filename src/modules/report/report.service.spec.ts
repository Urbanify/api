import { PrismaService } from '@infra/database/prisma/prisma.service';
import { UserRole } from '@modules/auth/entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ReportTargetType } from '@prisma/client';
import { UserType } from '@shared/decorators/active-user.decorator';

import { ReportService } from './report.service';

describe('ReportService', () => {
  const userType: UserType = {
    id: 'user-id',
    name: 'Ana',
    surname: 'Silva',
    role: UserRole.RESIDENT,
    cityId: 'city-a',
  };
  const prisma = {
    issue: { findFirst: jest.fn() },
    comment: { findFirst: jest.fn() },
    contentReport: { create: jest.fn() },
  };
  let service: ReportService;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [ReportService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(ReportService);
  });

  it('stores a report for an issue of the same city', async () => {
    prisma.issue.findFirst.mockResolvedValue({ id: 'issue-id' });

    await service.create(userType, {
      targetType: ReportTargetType.ISSUE,
      targetId: 'issue-id',
      reason: 'spam',
    });

    expect(prisma.issue.findFirst).toHaveBeenCalledWith({
      where: { id: 'issue-id', cityId: 'city-a' },
      select: { id: true },
    });
    expect(prisma.contentReport.create).toHaveBeenCalledWith({
      data: {
        reporterId: 'user-id',
        targetType: 'ISSUE',
        targetId: 'issue-id',
        reason: 'spam',
      },
    });
  });

  it('does not accept content from another city', async () => {
    prisma.comment.findFirst.mockResolvedValue(null);

    await expect(
      service.create(userType, {
        targetType: ReportTargetType.COMMENT,
        targetId: 'comment-id',
        reason: 'abuse',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.contentReport.create).not.toHaveBeenCalled();
  });
});
