import { Building } from '@modules/building/entities/building.entity';
import { Building as BuildingModel } from '@prisma/client';

export class BuildingModelToEntityMapper {
  static map(model: BuildingModel): Building {
    return {
      id: model.id,
      latitude: model.latitude,
      longitude: model.longitude,
      name: model.name,
      status: model.status,
      value: model.value,
      startDate: model.startDate,
      expectedEndDate: model.expectedEndDate,
      endDate: model.endDate,
      completionPercentage: model.completionPercentage,
      company: model.company,
      photos: model.photos,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }
}
