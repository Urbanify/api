import { CityRepository } from '@infra/database/prisma/repositories/city/city.repository';
import { FeatureFlagRepository } from '@infra/database/prisma/repositories/feature-flag/feature-flag.repository';
import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserType } from '@shared/decorators/active-user.decorator';

import { CityService } from './city.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { City, CityStatus } from './entities/city.entity';
import { UserRole } from '../auth/entities/user.entity';

describe('CityService', () => {
  let service: CityService;
  let cityRepository: CityRepository;
  let featureFlagRepository: FeatureFlagRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CityService,
        {
          provide: CityRepository,
          useValue: {
            create: jest.fn().mockResolvedValue(null),
            update: jest.fn().mockResolvedValue(null),
            findById: jest.fn().mockResolvedValue(null),
            deactivate: jest.fn().mockResolvedValue(null),
            list: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: FeatureFlagRepository,
          useValue: {
            list: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('token'),
          },
        },
      ],
    }).compile();

    service = module.get<CityService>(CityService);
    cityRepository = module.get<CityRepository>(CityRepository);
    featureFlagRepository = module.get<FeatureFlagRepository>(
      FeatureFlagRepository,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a city', async () => {
      const createInput: CreateCityDto = {
        name: 'My city',
        latitude: 'latitude',
        longitude: 'longitude',
      };

      await service.create(createInput);

      expect(featureFlagRepository.list).toHaveBeenCalledTimes(1);
      expect(cityRepository.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('deactivate', () => {
    it('should deactivate a city', async () => {
      const city: City = {
        id: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        name: 'My city',
        latitude: 'latitude',
        longitude: 'longitude',
        status: CityStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        featureFlags: [
          {
            cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
            featureFlagId: '5a85aa09-11d5-4cb4-94a3-cb716d61d876',
            slug: 'slug',
            description: 'desciption',
            status: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      jest.spyOn(cityRepository, 'findById').mockResolvedValueOnce(city);

      await service.deactivate(city.id);

      expect(cityRepository.deactivate).toHaveBeenCalledTimes(1);
      expect(cityRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should throw a not found exception when city not found', async () => {
      const id = 'id';

      const notFoundException = new NotFoundException(`city ${id} not found`);

      expect(service.deactivate(id)).rejects.toEqual(notFoundException);
    });
  });

  describe('update', () => {
    it('should update a city', async () => {
      const city: City = {
        id: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        name: 'My city',
        latitude: 'latitude',
        longitude: 'longitude',
        status: CityStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        featureFlags: [
          {
            cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
            featureFlagId: '5a85aa09-11d5-4cb4-94a3-cb716d61d876',
            slug: 'slug',
            description: 'desciption',
            status: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      jest.spyOn(cityRepository, 'findById').mockResolvedValueOnce(city);

      const updateInput: UpdateCityDto = {
        name: 'My city',
        latitude: 'latitude',
        longitude: 'longitude',
        status: CityStatus.ACTIVE,
        featureFlags: [
          {
            featureFlagId: '018a3b16-6ed1-465d-9b46-32f87bbd76f8',
            status: true,
          },
        ],
      };

      await service.update('2041dbfb-f0ee-43d2-9566-c041a1949207', updateInput);

      expect(cityRepository.update).toHaveBeenCalledTimes(1);
      expect(cityRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should throw a not found exception when city not found', async () => {
      const id = 'id';

      const updateInput: UpdateCityDto = {
        name: 'My city',
        latitude: 'latitude',
        longitude: 'longitude',
        status: CityStatus.ACTIVE,
        featureFlags: [
          {
            featureFlagId: '018a3b16-6ed1-465d-9b46-32f87bbd76f8',
            status: true,
          },
        ],
      };

      const notFoundException = new NotFoundException(`city ${id} not found`);

      expect(service.update(id, updateInput)).rejects.toEqual(
        notFoundException,
      );
    });
  });

  describe('list', () => {
    it('should list available cities', async () => {
      const cities = [
        {
          id: '2041dbfb-f0ee-43d2-9566-c041a1949207',
          name: 'My city',
          latitude: 'latitude',
          longitude: 'longitude',
          status: CityStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
          featureFlags: [
            {
              cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
              featureFlagId: '5a85aa09-11d5-4cb4-94a3-cb716d61d876',
              slug: 'slug',
              description: 'desciption',
              status: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        },
      ];

      jest.spyOn(cityRepository, 'list').mockResolvedValueOnce(cities);

      const result = await service.list();

      expect(result).toBeDefined();
      expect(result).toEqual(cities);
      expect(result.length).toEqual(1);
      expect(cityRepository.list).toHaveBeenCalledTimes(1);
    });
  });

  describe('get by id', () => {
    it('should get a city by id', async () => {
      const city: City = {
        id: '2041dbfb-f0ee-43d2-9566-c041a1949207',
        name: 'My city',
        latitude: 'latitude',
        longitude: 'longitude',
        status: CityStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        featureFlags: [
          {
            cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
            featureFlagId: '5a85aa09-11d5-4cb4-94a3-cb716d61d876',
            slug: 'slug',
            description: 'desciption',
            status: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      jest.spyOn(cityRepository, 'findById').mockResolvedValueOnce(city);

      const result = await service.getById(city.id);

      expect(result).toBeDefined();
      expect(result).toEqual(city);
      expect(cityRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should throw a not found exception when city not found', async () => {
      const id = 'id';

      const notFoundException = new NotFoundException(`city ${id} not found`);

      expect(service.getById(id)).rejects.toEqual(notFoundException);
    });
  });

  describe('access', () => {
    it('should generate a token for user from city id', async () => {
      const user: UserType = {
        id: '8cb4c3b7-0933-4c70-b307-0ced2dc3f4f9',
        name: 'John',
        surname: 'Doe',
        role: UserRole.ADMIN,
        cityId: '2041dbfb-f0ee-43d2-9566-c041a1949207',
      };

      const result = await service.access(user.cityId, user);

      expect(result).toBeDefined();
      expect(result.token).toEqual('token');
    });
  });
});
