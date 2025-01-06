import { Injectable } from '@nestjs/common';

import { FeatureFlagEntityToModelMapper } from './mappers/feature-flag-entity-to-model.mapper';
import { FeatureFlagModelToEntityMapper } from './mappers/feature-flag-model-to-entity.mapper';
import { PrismaService } from '../../prisma.service';
import { FeatureFlag } from '@modules/feature-flag/entities/feature-flag.entity';

@Injectable()
export class FeatureFlagRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(featureFlag: FeatureFlag): Promise<void> {
    const cities = await this.prismaService.city.findMany();

    const cityFeatures = cities.map((city) => ({
      cityId: city.id,
      status: false,
    }));

    const data = FeatureFlagEntityToModelMapper.map(featureFlag);

    await this.prismaService.featureFlag.create({
      data: {
        ...data,
        cityFeatures: {
          createMany: {
            data: cityFeatures,
          },
        },
      },
    });
  }

  public async findById(id: string): Promise<FeatureFlag | null> {
    const featureFlagModel = await this.prismaService.featureFlag.findUnique({
      where: {
        id,
      },
    });

    if (!featureFlagModel) {
      return null;
    }

    return FeatureFlagModelToEntityMapper.map(featureFlagModel);
  }

  public async list(): Promise<FeatureFlag[]> {
    const featureFlagModels = await this.prismaService.featureFlag.findMany();

    const entities = featureFlagModels.map((featureFlagModel) =>
      FeatureFlagModelToEntityMapper.map(featureFlagModel),
    );

    return entities;
  }

  public async update(featureFlag: FeatureFlag): Promise<void> {
    const data = FeatureFlagEntityToModelMapper.map(featureFlag);

    await this.prismaService.featureFlag.update({
      where: {
        id: featureFlag.id,
      },
      data,
    });
  }

  public async delete(id: string): Promise<void> {
    await this.prismaService.featureFlag.update({
      where: {
        id,
      },
      data: {
        deleted: true,
      },
    });
  }
}
