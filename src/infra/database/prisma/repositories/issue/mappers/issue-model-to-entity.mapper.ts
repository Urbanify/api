import { UserRole } from '@modules/auth/entities/user.entity';
import {
  Issue,
  IssueCategory,
  IssueHistoryAction,
  IssueStatus,
  IssueType,
} from '@modules/issue/entities/issue.entity';
import {
  IssueCategory as PrismaIssueCategory,
  IssueHistoryAction as PrismaIssueHistoryAction,
  IssueStatus as PrismaIssueStatus,
  IssueType as PrismaIssueType,
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
    type,
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
    type: PrismaIssueType;
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
      userName: string;
      action: PrismaIssueHistoryAction;
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
      type: IssueType[type],
      description,
      reporterId,
      fiscalId,
      managerId,
      createdAt,
      updatedAt,
      history:
        history &&
        history.map((history) => ({
          id: history.id,
          userId: history.userId,
          userName: history.userName,
          action: IssueHistoryAction[history.action],
          description: history.description,
          createdAt: history.createdAt,
          updatedAt: history.updatedAt,
        })),
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
