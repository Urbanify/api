import { UserRole } from '@modules/auth/entities/user.entity';
import { Comment } from '@modules/comment/entities/comment.entity';

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
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  ENVIRONMENT = 'ENVIRONMENT',
  TRANSPORTATION = 'TRANSPORTATION',
  SAFETY = 'SAFETY',
  COMUNITY = 'COMUNITY',
}

export enum IssueType {
  // INFRASTRUCTURE
  ROAD_POTHOLE = 'ROAD_POTHOLE',
  DAMAGED_SIGNAGE = 'DAMAGED_SIGNAGE',
  DAMAGED_SIDEWALK = 'DAMAGED_SIDEWALK',
  STREETLIGHT_OUT = 'STREETLIGHT_OUT',

  // ENVIRONMENT
  FALLEN_WIRES = 'FALLEN_WIRES',
  WALL_RISK_OF_COLLAPSE = 'WALL_RISK_OF_COLLAPSE',
  EROSION = 'EROSION',
  ABANDONED_CONSTRUCTION = 'ABANDONED_CONSTRUCTION',
  FALLEN_TREE = 'FALLEN_TREE',
  TREE_COLLAPSE_RISK = 'TREE_COLLAPSE_RISK',
  ILLEGAL_DEFORESTATION = 'ILLEGAL_DEFORESTATION',
  GARBAGE_ACCUMULATION = 'GARBAGE_ACCUMULATION',
  ILLEGAL_WASTE_DISPOSAL = 'ILLEGAL_WASTE_DISPOSAL',
  SEWAGE_LEAK = 'SEWAGE_LEAK',
  LACK_OF_SANITATION = 'LACK_OF_SANITATION',
  DEAD_ANIMALS = 'DEAD_ANIMALS',
  FLOODING = 'FLOODING',

  // TRANSPORTATION
  DAMAGED_BUS_STOP = 'DAMAGED_BUS_STOP',
  OBSTRUCTED_BIKE_LANE = 'OBSTRUCTED_BIKE_LANE',
  ILLEGAL_PARKING = 'ILLEGAL_PARKING',
  ABANDONED_VEHICLE = 'ABANDONED_VEHICLE',
  FADED_PEDESTRIAN_CROSSWALK = 'FADED_PEDESTRIAN_CROSSWALK',

  // SAFETY
  DARK_AREA = 'DARK_AREA',
  VANDALISM = 'VANDALISM',
  GRAFFITI = 'GRAFFITI',
  STRUCTURAL_RISK = 'STRUCTURAL_RISK',

  // COMUNITY
  ILLEGAL_OCCUPATION = 'ILLEGAL_OCCUPATION',
  ILLEGAL_CONSTRUCTION = 'ILLEGAL_CONSTRUCTION',
}

export enum IssueAction {}

export type Paginated<T> = {
  items: T[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  take: number;
};

export enum IssueHistoryAction {
  REPORTED_ISSUE = 'REPORTED_ISSUE',
  ASSIGNED_AS_FISCAL = 'ASSIGNED_AS_FISCAL',
  ASSIGNED_AS_MANAGER = 'ASSIGNED_AS_MANAGER',
  MARKED_AS_UNFOUNDED = 'MARKED_AS_UNFOUNDED',
  MARKED_AS_VALID = 'MARKED_AS_VALID',
  ADDED_RESOLUTION = 'ADDED_RESOLUTION',
  MARKED_AS_SOLVED = 'MARKED_AS_SOLVED',
}

export class Issue {
  id: string;
  status: IssueStatus;
  cityId: string;
  latitude: string;
  longitude: string;
  category: IssueCategory;
  type: IssueType;
  description: string;
  reporterId: string;
  fiscalId?: string;
  managerId?: string;
  createdAt: Date;
  updatedAt: Date;
  history: {
    id: string;
    userId: string;
    userName: string;
    action: IssueHistoryAction;
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
  comments?: Comment[];
}
