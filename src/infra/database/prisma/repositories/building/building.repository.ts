import { Building } from '@modules/building/entities/building.entity';
import { Injectable } from '@nestjs/common';
import { BuildingStatus } from '@prisma/client';

import { BuildingEntityToModelMapper } from './mappers/building-entity-to-model.mapper';
import { BuildingModelToEntityMapper } from './mappers/building-model-to-entity.mapper';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class BuildingRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(building: Building): Promise<void> {
    const data = BuildingEntityToModelMapper.map(building);
    await this.prismaService.building.create({
      data,
    });
  }

  public async findById(id: string): Promise<Building | null> {
    const buildingModel = await this.prismaService.building.findUnique({
      where: { id },
    });

    if (!buildingModel) {
      return null;
    }

    return BuildingModelToEntityMapper.map(buildingModel);
  }

  public async list(status?: BuildingStatus): Promise<Building[]> {
    const buildingsModel = await this.prismaService.building.findMany({
      where: status ? { status } : undefined,
    });

    return buildingsModel.map((buildingModel) =>
      BuildingModelToEntityMapper.map(buildingModel),
    );
  }

  public async save(building: Building): Promise<void> {
    const data = BuildingEntityToModelMapper.map(building);
    await this.prismaService.building.update({
      where: { id: building.id },
      data,
    });
  }
}
