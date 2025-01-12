import { FeatureFlagRepository } from '@infra/database/prisma/repositories/feature-flag/feature-flag.repository';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CreateFeatureFlagDto } from './dto/create-feature-flag.dto';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';
import { FeatureFlag } from './entities/feature-flag.entity';
import { FeatureFlagService } from './feature-flag.service';

describe('FeatureFlagService', () => {
  let service: FeatureFlagService;
  let featureFlagRepository: FeatureFlagRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureFlagService,
        {
          provide: FeatureFlagRepository,
          useValue: {
            create: jest.fn().mockResolvedValue(null),
            findById: jest.fn().mockResolvedValue(null),
            update: jest.fn().mockResolvedValue(null),
            delete: jest.fn().mockResolvedValue(null),
            list: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    service = module.get<FeatureFlagService>(FeatureFlagService);
    featureFlagRepository = module.get<FeatureFlagRepository>(
      FeatureFlagRepository,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a feature flag', async () => {
      const createInput: CreateFeatureFlagDto = {
        slug: 'ff',
        description: 'description',
      };

      await service.create(createInput);

      expect(featureFlagRepository.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update a feature flag', async () => {
      const featureFlag: FeatureFlag = {
        id: 'b6281bf4-bb46-490f-b59d-6db9e89f8ca8',
        slug: 'ff',
        description: 'description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(featureFlagRepository, 'findById')
        .mockResolvedValueOnce(featureFlag);

      const updateInput: UpdateFeatureFlagDto = {
        slug: 'ff2',
        description: 'description2',
      };

      await service.update('id', updateInput);

      expect(featureFlagRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should throw a not found exception when feature flag not found', async () => {
      const id = 'id';

      const updateInput: UpdateFeatureFlagDto = {
        slug: 'ff2',
        description: 'description2',
      };

      const notFoundException = new NotFoundException(
        `feature flag ${id} not found`,
      );

      expect(service.update(id, updateInput)).rejects.toEqual(
        notFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a feature flag', async () => {
      const featureFlag: FeatureFlag = {
        id: 'b6281bf4-bb46-490f-b59d-6db9e89f8ca8',
        slug: 'ff',
        description: 'description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(featureFlagRepository, 'findById')
        .mockResolvedValueOnce(featureFlag);

      await service.delete('id');

      expect(featureFlagRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw a not found exception when feature flag not found', async () => {
      const id = 'id';

      const notFoundException = new NotFoundException(
        `feature flag ${id} not found`,
      );

      expect(service.delete(id)).rejects.toEqual(notFoundException);
    });
  });

  describe('list', () => {
    it('should list feature flags', async () => {
      const featureFlag: FeatureFlag = {
        id: 'b6281bf4-bb46-490f-b59d-6db9e89f8ca8',
        slug: 'ff',
        description: 'description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(featureFlagRepository, 'list')
        .mockResolvedValueOnce([featureFlag]);

      const response = await service.list();

      expect(response).toBeDefined();
      expect(response).toEqual([featureFlag]);
    });
  });
});
