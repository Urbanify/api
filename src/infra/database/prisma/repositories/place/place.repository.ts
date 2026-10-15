import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma.service';

const placeSelect = {
  id: true,
  name: true,
  category: true,
  address: true,
  phone: true,
  hours: true,
  description: true,
  latitude: true,
  longitude: true,
  published: true,
  source: true,
} satisfies Prisma.CityPlaceSelect;

export type PlaceRow = Prisma.CityPlaceGetPayload<{
  select: typeof placeSelect;
}>;

@Injectable()
export class PlaceRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async listByCity(
    cityId: string,
    options: { publishedOnly: boolean },
  ): Promise<PlaceRow[]> {
    return this.prismaService.cityPlace.findMany({
      where: {
        cityId,
        ...(options.publishedOnly ? { published: true } : {}),
      },
      select: placeSelect,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  public async findByIdInCity(
    id: string,
    cityId: string,
  ): Promise<PlaceRow | null> {
    return this.prismaService.cityPlace.findFirst({
      where: { id, cityId },
      select: placeSelect,
    });
  }

  public async create(
    data: Prisma.CityPlaceUncheckedCreateInput,
  ): Promise<PlaceRow> {
    return this.prismaService.cityPlace.create({ data, select: placeSelect });
  }

  public async update(
    id: string,
    data: Prisma.CityPlaceUncheckedUpdateInput,
  ): Promise<PlaceRow> {
    return this.prismaService.cityPlace.update({
      where: { id },
      data,
      select: placeSelect,
    });
  }

  public async delete(id: string): Promise<void> {
    await this.prismaService.cityPlace.delete({ where: { id } });
  }
}
