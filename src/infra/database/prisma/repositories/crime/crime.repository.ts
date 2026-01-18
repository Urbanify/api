import {
  Crime,
  CrimeCategory,
  Paginated,
} from '@modules/crime/entities/crime.entity';
import { Injectable } from '@nestjs/common';

import { CrimeEntityToModelMapper } from './mappers/crime-entity-to-model.mapper';
import { CrimeModelToEntityMapper } from './mappers/crime-model-to-entity.mapper';
import { PrismaService } from '../../prisma.service';

type ListCrimesQueryFilter = {
  page: number;
  take?: number;
  start?: Date;
  end?: Date;
  category?: CrimeCategory;
};

@Injectable()
export class CrimeRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(crime: Crime): Promise<void> {
    const data = CrimeEntityToModelMapper.map(crime);
    await this.prismaService.crime.create({
      data,
    });
  }

  public async findById(id: string): Promise<Crime | null> {
    const crimeModel = await this.prismaService.crime.findUnique({
      where: { id },
    });

    if (!crimeModel) {
      return null;
    }

    return CrimeModelToEntityMapper.map(crimeModel);
  }

  public async list(
    queryFilter: ListCrimesQueryFilter,
  ): Promise<Paginated<Crime>> {
    const page = queryFilter.page;
    const take = queryFilter.take || 10;
    const skip = (page - 1) * take;

    const filter = {
      category: queryFilter.category,
      date: {
        gte: queryFilter.start,
        lt: queryFilter.end,
      },
    };

    const crimesModel = await this.prismaService.crime.findMany({
      where: filter,
      take: take + 1,
      skip,
      orderBy: {
        date: 'desc',
      },
    });

    const hasNextPage = crimesModel.length > take;
    const hasPreviousPage = page > 1;

    if (hasNextPage) {
      crimesModel.pop();
    }

    const crimes = crimesModel.map((crimeModel) =>
      CrimeModelToEntityMapper.map(crimeModel),
    );

    return {
      hasNextPage,
      hasPreviousPage,
      take,
      items: crimes,
      currentPage: page,
    };
  }
}
