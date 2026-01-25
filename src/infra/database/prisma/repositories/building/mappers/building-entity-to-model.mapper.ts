import { Building } from '@modules/building/entities/building.entity';
import { Prisma } from '@prisma/client';

export class BuildingEntityToModelMapper {
  static map(entity: Building): Prisma.BuildingCreateInput {
    return {
      id: entity.id,
      latitude: entity.latitude,
      longitude: entity.longitude,
      name: entity.name,
      status: entity.status,
      value: entity.value,
      startDate: entity.startDate,
      expectedEndDate: entity.expectedEndDate,
      endDate: entity.endDate,
      completionPercentage: entity.completionPercentage,
      company: entity.company,
      photos: entity.photos,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
