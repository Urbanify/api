import { Crime } from '@modules/crime/entities/crime.entity';
import { Prisma } from '@prisma/client';

export class CrimeEntityToModelMapper {
  static map(entity: Crime): Prisma.CrimeCreateInput {
    return {
      id: entity.id,
      category: entity.category,
      type: entity.type,
      latitude: entity.latitude,
      longitude: entity.longitude,
      address: entity.address,
      date: entity.date,
      details: entity.details,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
