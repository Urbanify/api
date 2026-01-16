import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash('senha@123', 10);
  const cityId = '2a6a2b50-5e6b-4a5a-9c6e-9a0c321c4f01';

  const city = await prisma.city.upsert({
    where: { id: cityId },
    update: {
      name: 'Sao Paulo',
      latitude: '-23.5505',
      longitude: '-46.6333',
      status: 'ACTIVE',
    },
    create: {
      id: cityId,
      name: 'Sao Paulo',
      latitude: '-23.5505',
      longitude: '-46.6333',
      status: 'ACTIVE',
    },
  });

  const resident1 = await prisma.user.upsert({
    where: { email: 'resident1@urbanify.dev' },
    update: {
      name: 'Carlos',
      surname: 'Silva',
      password: passwordHash,
      cpf: '11122233344',
      cityId: city.id,
      role: 'RESIDENT',
    },
    create: {
      name: 'Carlos',
      surname: 'Silva',
      email: 'resident1@urbanify.dev',
      password: passwordHash,
      cpf: '11122233344',
      cityId: city.id,
      role: 'RESIDENT',
    },
  });

  const resident2 = await prisma.user.upsert({
    where: { email: 'resident2@urbanify.dev' },
    update: {
      name: 'Marina',
      surname: 'Costa',
      password: passwordHash,
      cpf: '55566677788',
      cityId: city.id,
      role: 'RESIDENT',
    },
    create: {
      name: 'Marina',
      surname: 'Costa',
      email: 'resident2@urbanify.dev',
      password: passwordHash,
      cpf: '55566677788',
      cityId: city.id,
      role: 'RESIDENT',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@urbanify.dev' },
    update: {
      name: 'Ana',
      surname: 'Souza',
      password: passwordHash,
      cpf: '99988877766',
      cityId: city.id,
      role: 'ADMIN',
    },
    create: {
      name: 'Ana',
      surname: 'Souza',
      email: 'admin@urbanify.dev',
      password: passwordHash,
      cpf: '99988877766',
      cityId: city.id,
      role: 'ADMIN',
    },
  });

  const issue1Id = '9b0f1e1f-2db1-4f5b-9d88-fb00e0f6c101';
  const issue2Id = 'b5f744af-0c6f-4b4f-8a21-efb7b8f6c0d2';

  await prisma.issue.upsert({
    where: { id: issue1Id },
    update: {
      status: 'WAITING_FOR_FISCAL',
      cityId: city.id,
      latitude: '-23.5510',
      longitude: '-46.6336',
      category: 'INFRASTRUCTURE',
      type: 'ROAD_POTHOLE',
      description: 'Large pothole near the main avenue.',
      reporterId: resident1.id,
    },
    create: {
      id: issue1Id,
      status: 'WAITING_FOR_FISCAL',
      cityId: city.id,
      latitude: '-23.5510',
      longitude: '-46.6336',
      category: 'INFRASTRUCTURE',
      type: 'ROAD_POTHOLE',
      description: 'Large pothole near the main avenue.',
      reporterId: resident1.id,
      history: {
        create: [
          {
            userId: resident1.id,
            userName: `${resident1.name} ${resident1.surname}`,
            action: 'REPORTED_ISSUE',
          },
        ],
      },
    },
  });

  await prisma.issue.upsert({
    where: { id: issue2Id },
    update: {
      status: 'WAITING_FOR_FISCAL',
      cityId: city.id,
      latitude: '-23.5521',
      longitude: '-46.6341',
      category: 'SAFETY',
      type: 'DARK_AREA',
      description: 'Streetlight is out on the corner.',
      reporterId: resident2.id,
    },
    create: {
      id: issue2Id,
      status: 'WAITING_FOR_FISCAL',
      cityId: city.id,
      latitude: '-23.5521',
      longitude: '-46.6341',
      category: 'SAFETY',
      type: 'DARK_AREA',
      description: 'Streetlight is out on the corner.',
      reporterId: resident2.id,
      history: {
        create: [
          {
            userId: resident2.id,
            userName: `${resident2.name} ${resident2.surname}`,
            action: 'REPORTED_ISSUE',
          },
        ],
      },
    },
  });

  await prisma.issue.update({
    where: { id: issue1Id },
    data: {
      managerId: admin.id,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
