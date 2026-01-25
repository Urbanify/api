import { BuildingStatus } from '@prisma/client';

export class Building {
  id: string;
  latitude: string;
  longitude: string;
  name: string;
  status: BuildingStatus;
  value: string;
  startDate: Date;
  expectedEndDate: Date;
  endDate?: Date;
  completionPercentage: number;
  company: string;
  photos: string[];
  createdAt: Date;
  updatedAt: Date;
}
