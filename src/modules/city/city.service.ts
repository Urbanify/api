import { CityRepository } from '@infra/database/prisma/repositories/city/city.repository';
import { FeatureFlagRepository } from '@infra/database/prisma/repositories/feature-flag/feature-flag.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserType } from '@shared/decorators/active-user.decorator';
import { UUIDGenerator } from '@shared/uuid-generator';

import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CityService {
  constructor(
    private readonly cityRepository: CityRepository,
    private readonly featureFlagRepository: FeatureFlagRepository,
    private readonly jwtService: JwtService,
  ) {}

  public async create(createCityDto: CreateCityDto) {
    const now = new Date();

    const featureFlags = await this.featureFlagRepository.list();

    const id = UUIDGenerator.generate();

    await this.cityRepository.create({
      id,
      name: createCityDto.name,
      latitude: createCityDto.latitude,
      longitude: createCityDto.longitude,
      status: true,
      featureFlags: featureFlags.map((featureFlag) => ({
        cityId: id,
        featureFlagId: featureFlag.id,
        status: false,
        description: featureFlag.description,
        slug: featureFlag.slug,
        createdAt: featureFlag.createdAt,
        updatedAt: featureFlag.updatedAt,
      })),
      createdAt: now,
      updatedAt: now,
    });
  }

  public async deactivate(id: string) {
    const city = await this.cityRepository.findById(id);

    if (!city) {
      throw new NotFoundException(`city ${id} not found`);
    }

    await this.cityRepository.deactivate(id);
  }

  public async update(id: string, updateCityDto: UpdateCityDto) {
    const city = await this.cityRepository.findById(id);

    if (!city) {
      throw new NotFoundException(`city ${id} not found`);
    }

    await this.cityRepository.update({
      ...city,
      ...updateCityDto,
    });
  }

  public async list() {
    const cities = await this.cityRepository.list();

    return cities;
  }

  public async getById(id: string) {
    const city = await this.cityRepository.findById(id);

    if (!city) {
      throw new NotFoundException(`city ${id} not found`);
    }

    return city;
  }

  public async access(id: string, user: UserType) {
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        cityId: id,
      },
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      token,
    };
  }
}
