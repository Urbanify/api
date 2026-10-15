import { CityRepository } from '@infra/database/prisma/repositories/city/city.repository';
import {
  PlaceRepository,
  PlaceRow,
} from '@infra/database/prisma/repositories/place/place.repository';
import { UserRole } from '@modules/auth/entities/user.entity';
import { CityStatus } from '@modules/city/entities/city.entity';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PlaceCategory } from '@prisma/client';
import { UserType } from '@shared/decorators/active-user.decorator';

import { CreatePlaceDto } from './dto/create-place.dto';
import { PlaceService } from './place.service';

const CITY_A = '2a6a2b50-5e6b-4a5a-9c6e-9a0c321c4f01';
const CITY_B = '7f1c3e2a-0d4b-4c8e-9a11-5b6d7e8f9a0b';

const owner = (cityId: string): UserType => ({
  id: 'c5ca2e81-e1c5-4fbe-af5c-53d13b045380',
  name: 'Helena',
  surname: 'Lima',
  role: UserRole.OWNER,
  cityId,
});

const row = (overrides: Partial<PlaceRow>): PlaceRow => ({
  id: '11111111-1111-4111-8111-111111111111',
  name: 'UBS Exemplo',
  category: PlaceCategory.HEALTH,
  address: 'Rua A, 10',
  phone: null,
  hours: null,
  description: null,
  latitude: -10.9,
  longitude: -37.0,
  published: true,
  source: 'manual',
  ...overrides,
});

// In-memory stand-in that honors the cityId scoping the real repository applies.
function fakePlaceRepository(rows: (PlaceRow & { cityId: string })[]) {
  return {
    // Mirrors the select: cityId is not part of the returned row.
    listByCity: jest.fn(async (cityId: string, { publishedOnly }) =>
      rows
        .filter((r) => r.cityId === cityId && (!publishedOnly || r.published))
        .map(({ cityId: _cityId, ...place }) => place),
    ),
    findByIdInCity: jest.fn(
      async (id: string, cityId: string) =>
        rows.find((r) => r.id === id && r.cityId === cityId) ?? null,
    ),
    create: jest.fn(async (data) => {
      const created = row({ id: `new-${rows.length}`, ...data } as any);
      rows.push({ ...created, cityId: data.cityId } as any);
      return created;
    }),
    update: jest.fn(async (id: string, data) => {
      const place = rows.find((r) => r.id === id);
      Object.assign(place, data);
      return place;
    }),
    delete: jest.fn(async (id: string) => {
      rows.splice(
        rows.findIndex((r) => r.id === id),
        1,
      );
    }),
  };
}

describe('PlaceService', () => {
  let service: PlaceService;
  let placeRepository: ReturnType<typeof fakePlaceRepository>;
  let cityRepository: { findById: jest.Mock };
  let rows: (PlaceRow & { cityId: string })[];

  beforeEach(async () => {
    rows = [
      {
        ...row({ id: 'pub-a', name: 'UBS Centro', published: true }),
        cityId: CITY_A,
      },
      {
        ...row({ id: 'hid-a', name: 'UBS Oculta', published: false }),
        cityId: CITY_A,
      },
      {
        ...row({ id: 'other-b', name: 'UBS de outra cidade', published: true }),
        cityId: CITY_B,
      },
    ];
    placeRepository = fakePlaceRepository(rows);
    cityRepository = {
      findById: jest.fn(async (id: string) =>
        id === CITY_A
          ? { id: CITY_A, status: CityStatus.ACTIVE }
          : id === CITY_B
            ? { id: CITY_B, status: CityStatus.DISABLED }
            : null,
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaceService,
        { provide: PlaceRepository, useValue: placeRepository },
        { provide: CityRepository, useValue: cityRepository },
      ],
    }).compile();

    service = module.get<PlaceService>(PlaceService);
  });

  describe('listPublic', () => {
    it('returns only published places with the public fields', async () => {
      const places = await service.listPublic(CITY_A);

      expect(placeRepository.listByCity).toHaveBeenCalledWith(CITY_A, {
        publishedOnly: true,
      });
      expect(places.map((p) => p.id)).toEqual(['pub-a']);
      expect(Object.keys(places[0]).sort()).toEqual(
        [
          'address',
          'category',
          'description',
          'hours',
          'id',
          'latitude',
          'longitude',
          'name',
          'phone',
        ].sort(),
      );
    });

    it('returns 404 when the city does not exist', async () => {
      await expect(
        service.listPublic('00000000-0000-4000-8000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns 404 when the city is not active', async () => {
      await expect(service.listPublic(CITY_B)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('listForStaff', () => {
    it('lists the token city only, including unpublished places', async () => {
      const places = await service.listForStaff(owner(CITY_A));

      expect(placeRepository.listByCity).toHaveBeenCalledWith(CITY_A, {
        publishedOnly: false,
      });
      expect(places.map((p) => p.id).sort()).toEqual(['hid-a', 'pub-a']);
    });
  });

  describe('create', () => {
    it('stores the place in the token city and ignores cityId and source from the body', async () => {
      const dto = {
        name: 'Ecoponto Novo',
        category: PlaceCategory.WASTE,
        latitude: -10.95,
        longitude: -37.05,
        cityId: CITY_B,
        source: 'osm',
      } as CreatePlaceDto;

      await service.create(owner(CITY_A), dto);

      expect(placeRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          cityId: CITY_A,
          source: 'manual',
          name: 'Ecoponto Novo',
        }),
      );
      expect(placeRepository.create.mock.calls[0][0]).not.toHaveProperty(
        'cityId',
        CITY_B,
      );
    });
  });

  describe('update', () => {
    it('returns 404 for a place of another city and does not change it', async () => {
      await expect(
        service.update('other-b', owner(CITY_A), { name: 'Invadido' }),
      ).rejects.toThrow(NotFoundException);

      expect(placeRepository.update).not.toHaveBeenCalled();
      expect(rows.find((r) => r.id === 'other-b').name).toBe(
        'UBS de outra cidade',
      );
    });

    it('updates a place of the token city', async () => {
      await service.update('pub-a', owner(CITY_A), { published: false });

      expect(placeRepository.update).toHaveBeenCalledWith(
        'pub-a',
        expect.objectContaining({ published: false, name: undefined }),
      );
    });
  });

  describe('delete', () => {
    it('returns 404 for a place of another city and keeps it', async () => {
      await expect(service.delete('other-b', owner(CITY_A))).rejects.toThrow(
        NotFoundException,
      );

      expect(placeRepository.delete).not.toHaveBeenCalled();
      expect(rows.some((r) => r.id === 'other-b')).toBe(true);
    });

    it('deletes a place of the token city', async () => {
      await service.delete('hid-a', owner(CITY_A));

      expect(placeRepository.delete).toHaveBeenCalledWith('hid-a');
    });
  });
});
