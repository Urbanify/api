import { Injectable, NotFoundException } from '@nestjs/common';
import { BuildingStatus } from '@prisma/client';

import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { BuildingRepository } from '../../infra/database/prisma/repositories/building/building.repository';
import { UUIDGenerator } from '../../shared/uuid-generator';

@Injectable()
export class BuildingService {
  constructor(private readonly buildingRepository: BuildingRepository) {}

  async create(createBuildingDto: CreateBuildingDto) {
    await this.buildingRepository.create({
      id: UUIDGenerator.generate(),
      name: createBuildingDto.name,
      latitude: createBuildingDto.latitude,
      longitude: createBuildingDto.longitude,
      status: createBuildingDto.status,
      value: createBuildingDto.value,
      startDate: new Date(createBuildingDto.startDate),
      expectedEndDate: new Date(createBuildingDto.expectedEndDate),
      endDate: createBuildingDto.endDate
        ? new Date(createBuildingDto.endDate)
        : undefined,
      completionPercentage: createBuildingDto.completionPercentage,
      company: createBuildingDto.company,
      photos: createBuildingDto.photos,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async findAll(status?: BuildingStatus) {
    return this.buildingRepository.list(status);
  }

  async findOne(id: string) {
    const building = await this.buildingRepository.findById(id);

    if (!building) {
      throw new NotFoundException(`Building ${id} not found`);
    }

    return building;
  }

  async update(id: string, updateBuildingDto: UpdateBuildingDto) {
    const building = await this.buildingRepository.findById(id);

    if (!building) {
      throw new NotFoundException(`Building ${id} not found`);
    }

    const updatedBuilding = {
      ...building,
      ...updateBuildingDto,
      startDate: updateBuildingDto.startDate
        ? new Date(updateBuildingDto.startDate)
        : building.startDate,
      expectedEndDate: updateBuildingDto.expectedEndDate
        ? new Date(updateBuildingDto.expectedEndDate)
        : building.expectedEndDate,
      endDate: updateBuildingDto.endDate
        ? new Date(updateBuildingDto.endDate)
        : building.endDate,
      updatedAt: new Date(),
    };

    await this.buildingRepository.save(updatedBuilding);

    return updatedBuilding;
  }
}
