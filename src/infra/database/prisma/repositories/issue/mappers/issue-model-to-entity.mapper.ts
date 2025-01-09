import { UserRole } from '@modules/auth/entities/user.entity';
import {
  Issue,
  IssueCategory,
  IssueStatus,
} from '@modules/issue/entities/issue.entity';
import {
  IssueCategory as PrismaIssueCategory,
  IssueStatus as PrismaIssueStatus,
  UserRole as PrismaUserRole,
} from '@prisma/client';

export class CityModelToEntityMapper {
  public static map({
    id,
    status,
    cityId,
    latitude,
    longitude,
    category,
    description,
    reporterId,
    fiscalId,
    managerId,
    createdAt,
    updatedAt,
    history,
    photos,
    manager,
  }: {
    id: string;
    status: PrismaIssueStatus;
    cityId: string;
    latitude: string;
    longitude: string;
    category: PrismaIssueCategory;
    description: string;
    reporterId: string;
    fiscalId?: string;
    managerId?: string;
    createdAt: Date;
    updatedAt: Date;
    history?: {
      id: string;
      description: string | null;
      createdAt: Date;
      updatedAt: Date;
      userId: string | null;
      action: string;
      issueId: string;
    }[];
    photos?: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      url: string;
      issueId: string;
    }[];
    manager?: {
      id: string;
      cityId: string | null;
      createdAt: Date;
      updatedAt: Date;
      name: string;
      surname: string;
      email: string;
      password: string;
      cpf: string;
      role: PrismaUserRole;
    };
  }): Issue {
    return {
      id,
      status: IssueStatus[status],
      cityId,
      latitude,
      longitude,
      category: IssueCategory[category],
      description,
      reporterId,
      fiscalId,
      managerId,
      createdAt,
      updatedAt,
      history,
      photos: photos?.map((photo) => photo.url),
      manager: manager && {
        id: manager.id,
        name: manager.name,
        surname: manager.surname,
        email: manager.email,
        cpf: manager.cpf,
        cityId: manager.cityId,
        role: UserRole[manager.role],
        createdAt: manager.createdAt,
        updatedAt: manager.updatedAt,
      },
    };
  }
}
