import { FeatureFlag } from 'src/modules/feature-flag/entities/feature-flag.entity';

export class FeatureFlagEntityToModelMapper {
  public static map({
    id,
    slug,
    description,
    createdAt,
    updatedAt,
  }: FeatureFlag) {
    const data = {
      id,
      slug,
      description,
      createdAt,
      updatedAt,
    };

    return data;
  }
}
