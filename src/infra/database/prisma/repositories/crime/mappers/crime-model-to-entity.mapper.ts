import {
  Crime,
  CrimeCategory,
  CrimeType,
} from '@modules/crime/entities/crime.entity';
import {
  Crime as CrimeModel,
  CrimeCategory as CrimeCategoryModel,
  CrimeType as CrimeTypeModel,
} from '@prisma/client';

export class CrimeModelToEntityMapper {
  static map(model: CrimeModel): Crime {
    return {
      id: model.id,
      category: CrimeModelToEntityMapper.mapCategory(model.category),
      type: CrimeModelToEntityMapper.mapType(model.type),
      latitude: model.latitude,
      longitude: model.longitude,
      address: model.address,
      date: model.date,
      details: model.details,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }

  private static mapCategory(category: CrimeCategoryModel): CrimeCategory {
    return CrimeCategory[category];
  }

  static mapType(type: CrimeTypeModel): CrimeType {
    return CrimeType[type];
  }
}
