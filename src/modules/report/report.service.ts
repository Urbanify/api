import { PrismaService } from '@infra/database/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ReportTargetType } from '@prisma/client';
import { UserType } from '@shared/decorators/active-user.decorator';

import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportService {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(userType: UserType, dto: CreateReportDto) {
    // The target must be in the city of the user, so a report never reveals content of other cities.
    const where = { id: dto.targetId, cityId: userType.cityId };
    const target =
      dto.targetType === ReportTargetType.ISSUE
        ? await this.prismaService.issue.findFirst({
            where,
            select: { id: true },
          })
        : await this.prismaService.comment.findFirst({
            where,
            select: { id: true },
          });

    if (!target) {
      throw new NotFoundException('content not found');
    }

    await this.prismaService.contentReport.create({
      data: {
        reporterId: userType.id,
        targetType: dto.targetType,
        targetId: dto.targetId,
        reason: dto.reason,
      },
    });
  }
}
