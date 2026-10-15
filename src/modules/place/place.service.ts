import { CityRepository } from '@infra/database/prisma/repositories/city/city.repository';
import {
  PlaceRepository,
  PlaceRow,
} from '@infra/database/prisma/repositories/place/place.repository';
import { CityStatus } from '@modules/city/entities/city.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserType } from '@shared/decorators/active-user.decorator';

import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';

@Injectable()
export class PlaceService {
  constructor(
    private readonly placeRepository: PlaceRepository,
    private readonly cityRepository: CityRepository,
  ) {}

  public async listPublic(cityId: string) {
    const city = await this.cityRepository.findById(cityId);

    if (!city || city.status !== CityStatus.ACTIVE) {
      throw new NotFoundException(`city ${cityId} not found`);
    }

    const places = await this.placeRepository.listByCity(cityId, {
      publishedOnly: true,
    });

    return places.map((place) => ({
      id: place.id,
      name: place.name,
      category: place.category,
      address: place.address,
      phone: place.phone,
      hours: place.hours,
      description: place.description,
      latitude: place.latitude,
      longitude: place.longitude,
    }));
  }

  public async listForStaff(userType: UserType) {
    return this.placeRepository.listByCity(userType.cityId, {
      publishedOnly: false,
    });
  }

  public async create(userType: UserType, createPlaceDto: CreatePlaceDto) {
    return this.placeRepository.create({
      ...this.toFields(createPlaceDto),
      cityId: userType.cityId,
      source: 'manual',
    });
  }

  public async update(
    id: string,
    userType: UserType,
    updatePlaceDto: UpdatePlaceDto,
  ) {
    await this.findInCityOrFail(id, userType.cityId);

    return this.placeRepository.update(id, this.toFields(updatePlaceDto));
  }

  public async delete(id: string, userType: UserType) {
    await this.findInCityOrFail(id, userType.cityId);

    await this.placeRepository.delete(id);
  }

  private async findInCityOrFail(
    id: string,
    cityId: string,
  ): Promise<PlaceRow> {
    const place = await this.placeRepository.findByIdInCity(id, cityId);

    if (!place) {
      throw new NotFoundException(`place ${id} not found`);
    }

    return place;
  }

  // Whitelists the body fields: cityId and source never come from the request.
  private toFields(dto: Partial<CreatePlaceDto>) {
    return {
      name: dto.name,
      category: dto.category,
      latitude: dto.latitude,
      longitude: dto.longitude,
      address: dto.address,
      phone: dto.phone,
      hours: dto.hours,
      description: dto.description,
      published: dto.published,
    };
  }
}
