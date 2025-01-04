import { FeatureFlag } from 'src/modules/feature-flag/entities/feature-flag.entity';

export class FeatureFlagModelToEntityMapper {
  public static map({
    id,
    slug,
    description,
    createdAt,
    updatedAt,
  }): FeatureFlag {
    return {
      id,
      slug,
      description,
      createdAt,
      updatedAt,
    };
  }
}
