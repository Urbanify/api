import { Injectable } from '@nestjs/common';
import { FeatureFlag } from 'src/modules/feature-flag/entities/feature-flag.entity';
import { PrismaService } from '../../prisma.service';
import { FeatureFlagEntityToModelMapper } from './mappers/feature-flag-entity-to-model.mapper';
import { FeatureFlagModelToEntityMapper } from './mappers/feature-flag-model-to-entity.mapper';

@Injectable()
export class FeatureFlagRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(featureFlag: FeatureFlag): Promise<void> {
    const data = FeatureFlagEntityToModelMapper.map(featureFlag);

    await this.prismaService.featureFlag.create({
      data,
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
