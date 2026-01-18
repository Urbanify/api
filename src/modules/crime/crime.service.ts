import { CrimeRepository } from '@infra/database/prisma/repositories/crime/crime.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UUIDGenerator } from '@shared/uuid-generator';

import { CreateCrimeDto } from './dto/create-crime.dto';
import { ListCrimesFilterDto } from './dto/list-crimes.dto';

@Injectable()
export class CrimeService {
  constructor(private readonly crimeRepository: CrimeRepository) {}

  public async create(createCrimeDto: CreateCrimeDto) {
    await this.crimeRepository.create({
      id: UUIDGenerator.generate(),
      category: createCrimeDto.category,
      type: createCrimeDto.type,
      latitude: createCrimeDto.latitude,
      longitude: createCrimeDto.longitude,
      address: createCrimeDto.address,
      date: new Date(createCrimeDto.date),
      details: createCrimeDto.details,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public async list(filter: ListCrimesFilterDto) {
    const queryFilter = {
      page: Number(filter.page),
      take: filter.take && Number(filter.take),
      start: filter.start ? new Date(filter.start) : undefined,
      end: filter.end ? new Date(filter.end) : undefined,
      category: filter.category,
    };

    return this.crimeRepository.list(queryFilter);
  }

  public async getById(id: string) {
    const crime = await this.crimeRepository.findById(id);

    if (!crime) {
      throw new NotFoundException(`crime ${id} not found`);
    }

    return crime;
  }
}
