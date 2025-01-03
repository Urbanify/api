import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFeatureFlagDto } from './dto/create-feature-flag.dto';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';
import { FeatureFlagRepository } from '@infra/database/prisma/repositories/feature-flag/feature-flag.repository';
import { UUIDGenerator } from '@shared/uuid-generator';

@Injectable()
export class FeatureFlagService {
  constructor(private readonly featureFlagRepository: FeatureFlagRepository) {}

  public async create(createFeatureFlagDto: CreateFeatureFlagDto) {
    const now = new Date();

    await this.featureFlagRepository.create({
      id: UUIDGenerator.generate(),
      slug: createFeatureFlagDto.slug,
      description: createFeatureFlagDto.description,
      createdAt: now,
      updatedAt: now,
    });
  }

  public async update(id: string, updateFeatureFlagDto: UpdateFeatureFlagDto) {
    const featureFlag = await this.featureFlagRepository.findById(id);

    if (!featureFlag) {
      throw new NotFoundException(`feature flag ${id} not found`);
    }

    const data = {
      ...featureFlag,
      ...updateFeatureFlagDto,
    };

    await this.featureFlagRepository.update(data);
  }

  public async delete(id: string) {
    const featureFlag = await this.featureFlagRepository.findById(id);

    if (!featureFlag) {
      throw new NotFoundException(`feature flag ${id} not found`);
    }

    await this.featureFlagRepository.delete(id);
  }
}
