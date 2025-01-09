import { UserRole } from '@modules/auth/entities/user.entity';

export enum IssueStatus {
  WAITING_FOR_FISCAL = 'WAITING_FOR_FISCAL',
  WAITING_FOR_PROCEDURE = 'WAITING_FOR_PROCEDURE',
  WAITING_FOR_MANAGER = 'WAITING_FOR_MANAGER',
  WAITING_FOR_MANAGER_RESOLUTION = 'WAITING_FOR_MANAGER_RESOLUTION',
  WAITING_FOR_RESOLUTION_VALIDATION = 'WAITING_FOR_RESOLUTION_VALIDATION',
  SOLVED = 'SOLVED',
  CLOSED = 'CLOSED',
}

export enum IssueCategory {
  URBAN = 'URBAN',
}

export type Paginated<T> = {
  items: T[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  take: number;
};

export class Issue {
  id: string;
  status: IssueStatus;
  cityId: string;
  latitude: string;
  longitude: string;
  category: IssueCategory;
  description: string;
  reporterId: string;
  fiscalId?: string;
  managerId?: string;
  createdAt: Date;
  updatedAt: Date;
  history: {
    id: string;
    userId: string;
    action: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  photos: string[];
  manager?: {
    id: string;
    name: string;
    surname: string;
    email: string;
    cpf: string;
    cityId?: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
  };
}
