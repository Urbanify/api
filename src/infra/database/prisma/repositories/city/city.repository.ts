import { Injectable } from '@nestjs/common';

import { CityEntityToModelMapper } from './mappers/city-entity-to-model.mapper';
import { CityModelToEntityMapper } from './mappers/city-model-to-entity.mapper';
import { PrismaService } from '../../prisma.service';
import { City } from '@modules/city/entities/city.entity';

@Injectable()
export class CityRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(city: City): Promise<void> {
    const data = CityEntityToModelMapper.map(city);

    await this.prismaService.city.create({
      data: {
        ...data,
        cityFeatures: {
          createMany: {
            data: data.cityFeatures,
          },
        },
      },
    });
  }

  public async findById(id: string): Promise<City | null> {
    const cityModel = await this.prismaService.city.findUnique({
      where: {
        id,
      },
      include: {
        cityFeatures: {
          include: {
            featureFlag: true,
          },
        },
      },
    });

    if (!cityModel) {
      return null;
    }

    return CityModelToEntityMapper.map(cityModel);
  }

  public async deactivate(id: string): Promise<void> {
    await this.prismaService.city.update({
      where: {
        id,
      },
      data: {
        status: 'DISABLED',
      },
    });
  }

  public async update(city: City): Promise<void> {
    const data = CityEntityToModelMapper.map(city);

    const cityFeaturesUpdatedPromises = data.cityFeatures.map((cityFeature) => {
      return this.prismaService.cityFeature.update({
        where: {
          cityId_featureFlagId: {
            cityId: data.id,
            featureFlagId: cityFeature.featureFlagId,
          },
        },
        data: {
          status: cityFeature.status,
        },
      });
    });

    const cityUpdatedPromise = this.prismaService.city.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        status: data.status,
      },
    });

    await Promise.all([...cityFeaturesUpdatedPromises, cityUpdatedPromise]);
  }

  public async list(): Promise<City[]> {
    const cityModels = await this.prismaService.city.findMany({
      include: {
        cityFeatures: {
          include: {
            featureFlag: true,
          },
        },
      },
    });

    const cities = cityModels.map((cityModel) =>
      CityModelToEntityMapper.map(cityModel),
    );

    return cities;
  }
}
