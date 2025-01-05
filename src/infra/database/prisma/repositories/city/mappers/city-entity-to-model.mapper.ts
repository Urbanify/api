import { City } from 'src/modules/city/entities/city.entity';

export class CityEntityToModelMapper {
  public static map({
    id,
    name,
    latitude,
    longitude,
    status,
    createdAt,
    updatedAt,
    featureFlags,
  }: City) {
    const data = {
      id,
      name,
      latitude,
      longitude,
      status,
      cityFeatures: featureFlags.map((featureFlag) => ({
        featureFlagId: featureFlag.featureFlagId,
        status: featureFlag.status,
        createdAt: featureFlag.createdAt,
        updatedAt: featureFlag.updatedAt,
      })),
      createdAt,
      updatedAt,
    };

    return data;
  }
}
