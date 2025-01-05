import { CityStatus as PrimaCityStatus } from '@prisma/client';
import { City, CityStatus } from 'src/modules/city/entities/city.entity';

export class CityModelToEntityMapper {
  public static map({
    id,
    name,
    latitude,
    longitude,
    status,
    createdAt,
    updatedAt,
    cityFeatures,
  }: {
    id: string;
    name: string;
    latitude: string;
    longitude: string;
    status: PrimaCityStatus;
    createdAt: Date;
    updatedAt: Date;
    cityFeatures: {
      id: string;
      status: boolean;
      createdAt: Date;
      updatedAt: Date;
      featureFlagId: string;
      cityId: string;
      featureFlag: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string;
        deleted: boolean;
      };
    }[];
  }): City {
    return {
      id,
      name,
      latitude,
      longitude,
      status: CityStatus[status],
      createdAt,
      updatedAt,
      featureFlags: cityFeatures.map((cityFeature) => ({
        cityId: cityFeature.cityId,
        featureFlagId: cityFeature.featureFlagId,
        status: cityFeature.status,
        slug: cityFeature.featureFlag.slug,
        description: cityFeature.featureFlag.description,
        createdAt: cityFeature.createdAt,
        updatedAt: cityFeature.updatedAt,
      })),
    };
  }
}
