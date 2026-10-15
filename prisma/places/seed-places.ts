import type { PlaceCategory, PrismaClient } from '@prisma/client';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Public places (tourism, UBS, schools, waste points, services, parks) shown
// on the citizen map. Idempotent: rerunning updates the content of seeded
// rows. `published` is left alone so a city can hide places without a reseed.

type PlaceSeed = {
  name: string;
  category: PlaceCategory;
  address: string | null;
  phone: string | null;
  hours: string | null;
  description: string | null;
  latitude: number;
  longitude: number;
  source: 'manual' | 'osm';
};

type PlacesFile = { attribution: string; places: PlaceSeed[] };

// Stable ids, same idea as the main seed's issueId: md5 shaped as a uuid.
const placeId = (p: PlaceSeed) => {
  const h = createHash('md5')
    .update(`urbanify-place-${p.source}|${p.name}|${p.latitude}|${p.longitude}`)
    .digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
};

export async function seedPlaces(prisma: PrismaClient, cityId: string) {
  const file: PlacesFile = JSON.parse(
    readFileSync(join(__dirname, 'aracaju.json'), 'utf8'),
  );

  for (const p of file.places) {
    const content = {
      name: p.name,
      category: p.category,
      address: p.address,
      phone: p.phone,
      hours: p.hours,
      description: p.description,
      latitude: p.latitude,
      longitude: p.longitude,
      source: p.source,
    };

    await prisma.cityPlace.upsert({
      where: { id: placeId(p) },
      update: content,
      create: { id: placeId(p), cityId, ...content },
    });
  }

  return file.places.length;
}
