import type {
  IssueCategory,
  IssueHistoryAction,
  IssueStatus,
  IssueType,
  UserRole,
} from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { createHash } from 'node:crypto';

// Demo seed for the staging environment: the city of Aracaju (SE) with
// issues at every stage of the workflow. It is idempotent and resets the
// demo city on every run, so each deploy starts from the same state.

const prisma = new PrismaClient();

const CITY_ID = '2a6a2b50-5e6b-4a5a-9c6e-9a0c321c4f01';

const USERS: {
  key: string;
  name: string;
  surname: string;
  email: string;
  cpf: string;
  role: UserRole;
}[] = [
  {
    key: 'carlos',
    name: 'Carlos',
    surname: 'Silva',
    email: 'contato+carlos@urbanify.com.br',
    cpf: '11122233344',
    role: 'RESIDENT',
  },
  {
    key: 'marina',
    name: 'Marina',
    surname: 'Costa',
    email: 'contato+marina@urbanify.com.br',
    cpf: '55566677788',
    role: 'RESIDENT',
  },
  {
    key: 'ana',
    name: 'Ana',
    surname: 'Souza',
    email: 'contato+ana@urbanify.com.br',
    cpf: '99988877766',
    role: 'ADMIN',
  },
  {
    key: 'roberto',
    name: 'Roberto',
    surname: 'Lima',
    email: 'contato+roberto@urbanify.com.br',
    cpf: '20030040050',
    role: 'MANAGER',
  },
  {
    key: 'helena',
    name: 'Helena',
    surname: 'Rocha',
    email: 'contato+helena@urbanify.com.br',
    cpf: '60070080090',
    role: 'OWNER',
  },
  {
    key: 'joao',
    name: 'João',
    surname: 'Pereira',
    email: 'contato+joao@urbanify.com.br',
    cpf: '30040050060',
    role: 'RESIDENT',
  },
  {
    key: 'patricia',
    name: 'Patrícia',
    surname: 'Alves',
    email: 'contato+patricia@urbanify.com.br',
    cpf: '40050060070',
    role: 'RESIDENT',
  },
  {
    key: 'lucas',
    name: 'Lucas',
    surname: 'Martins',
    email: 'contato+lucas@urbanify.com.br',
    cpf: '50060070080',
    role: 'RESIDENT',
  },
];

const PHOTO = {
  pothole:
    'https://upload.wikimedia.org/wikipedia/commons/8/86/Pothole_in_Villeray%2C_Montr%C3%A9al.jpg',
  tree: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Fallen_tree.jpg',
  light: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Street_light.jpg',
  sidewalk:
    'https://upload.wikimedia.org/wikipedia/commons/f/ff/Broken_sidewalk.jpg',
};

type Stage =
  | 'reported'
  | 'fiscal'
  | 'validated'
  | 'in_progress'
  | 'resolution'
  | 'solved'
  | 'closed';

const STATUS: Record<Stage, IssueStatus> = {
  reported: 'WAITING_FOR_FISCAL',
  fiscal: 'WAITING_FOR_PROCEDURE',
  validated: 'WAITING_FOR_MANAGER',
  in_progress: 'WAITING_FOR_MANAGER_RESOLUTION',
  resolution: 'WAITING_FOR_RESOLUTION_VALIDATION',
  solved: 'SOLVED',
  closed: 'CLOSED',
};

// [id suffix, reporter, fiscal, stage, days ago, lat, lng, category, type, description, photo, comment]
const ISSUES: [
  string,
  string,
  string | null,
  Stage,
  number,
  string,
  string,
  IssueCategory,
  IssueType,
  string,
  string | null,
  string | null,
][] = [
  [
    '01',
    'carlos',
    'marina',
    'solved',
    12,
    '-10.9352',
    '-37.0478',
    'INFRASTRUCTURE',
    'ROAD_POTHOLE',
    'Buraco grande na Av. Beira Mar, altura do bairro Treze de Julho. Carros desviando para a outra faixa.',
    PHOTO.pothole,
    'Passo aqui todo dia, ficou ótimo depois do conserto.',
  ],
  [
    '02',
    'joao',
    'patricia',
    'resolution',
    6,
    '-10.9481',
    '-37.0592',
    'INFRASTRUCTURE',
    'STREETLIGHT_OUT',
    'Poste apagado há duas semanas na Av. Ministro Geraldo Barreto Sobral, nos Jardins. Trecho muito escuro à noite.',
    PHOTO.light,
    'Muita gente faz caminhada aqui à noite, é urgente.',
  ],
  [
    '03',
    'patricia',
    'lucas',
    'validated',
    4,
    '-10.9112',
    '-37.0503',
    'ENVIRONMENT',
    'FALLEN_TREE',
    'Árvore caiu depois da chuva e está bloqueando metade da calçada na Rua Laranjeiras, Centro.',
    PHOTO.tree,
    null,
  ],
  [
    '04',
    'lucas',
    'carlos',
    'fiscal',
    2,
    '-10.9205',
    '-37.0689',
    'INFRASTRUCTURE',
    'DAMAGED_SIDEWALK',
    'Calçada quebrada em frente à escola na Rua Itabaiana, Siqueira Campos. Risco para idosos e crianças.',
    PHOTO.sidewalk,
    null,
  ],
  [
    '05',
    'marina',
    'joao',
    'solved',
    18,
    '-10.9418',
    '-37.0641',
    'ENVIRONMENT',
    'GARBAGE_ACCUMULATION',
    'Lixo acumulado na esquina da Av. Hermes Fontes, no Grageru, há mais de uma semana.',
    null,
    'Coleta passou e limpou tudo. Obrigada!',
  ],
  [
    '06',
    'carlos',
    null,
    'reported',
    1,
    '-10.9612',
    '-37.0598',
    'TRANSPORTATION',
    'FADED_PEDESTRIAN_CROSSWALK',
    'Faixa de pedestre apagada em cruzamento movimentado na Av. Tancredo Neves, Inácio Barbosa.',
    null,
    null,
  ],
  [
    '07',
    'joao',
    null,
    'reported',
    1,
    '-10.9963',
    '-37.0452',
    'SAFETY',
    'DARK_AREA',
    'Trecho da Orla de Atalaia sem iluminação perto dos quiosques. Moradores evitam passar à noite.',
    null,
    null,
  ],
  [
    '08',
    'patricia',
    'marina',
    'closed',
    9,
    '-10.9252',
    '-37.0561',
    'SAFETY',
    'GRAFFITI',
    'Pichação no muro da UBS do bairro São José.',
    null,
    null,
  ],
  [
    '09',
    'lucas',
    null,
    'reported',
    0,
    '-10.9388',
    '-37.0742',
    'ENVIRONMENT',
    'SEWAGE_LEAK',
    'Vazamento de esgoto a céu aberto na rua lateral do mercado, no bairro Luzia.',
    null,
    null,
  ],
  [
    '10',
    'marina',
    'patricia',
    'in_progress',
    5,
    '-10.9151',
    '-37.0588',
    'TRANSPORTATION',
    'DAMAGED_BUS_STOP',
    'Ponto de ônibus sem cobertura e com o vidro quebrado na Av. Desembargador Maynard, Getúlio Vargas.',
    null,
    'Na chuva não tem onde esperar o ônibus.',
  ],
  [
    '11',
    'carlos',
    'lucas',
    'resolution',
    7,
    '-10.9693',
    '-37.0571',
    'ENVIRONMENT',
    'FLOODING',
    'Alagamento toda vez que chove na Av. Murilo Dantas, Farolândia. Bueiro entupido.',
    null,
    null,
  ],
  [
    '12',
    'joao',
    'carlos',
    'validated',
    3,
    '-10.9802',
    '-37.0398',
    'INFRASTRUCTURE',
    'DAMAGED_SIGNAGE',
    'Placa de PARE caída no cruzamento da Coroa do Meio.',
    null,
    null,
  ],
  [
    '13',
    'patricia',
    'joao',
    'in_progress',
    8,
    '-10.9135',
    '-37.0478',
    'INFRASTRUCTURE',
    'ROAD_POTHOLE',
    'Vários buracos na Av. Ivo do Prado, perto da Ponte do Imperador.',
    PHOTO.pothole,
    null,
  ],
  [
    '14',
    'lucas',
    'marina',
    'solved',
    22,
    '-10.9455',
    '-37.0503',
    'INFRASTRUCTURE',
    'STREETLIGHT_OUT',
    'Lâmpadas queimadas na praça do bairro Salgado Filho.',
    PHOTO.light,
    null,
  ],
];

// Stable ids that still look distinct on screen (the UI shows the first characters).
const issueId = (suffix: string) => {
  const h = createHash('md5')
    .update(`urbanify-demo-issue-${suffix}`)
    .digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
};
const fullName = (u: { name: string; surname: string }) =>
  `${u.name} ${u.surname}`;

async function main() {
  const passwordHash = await hash('senha@123', 10);

  const city = await prisma.city.upsert({
    where: { id: CITY_ID },
    update: {
      name: 'Aracaju',
      latitude: '-10.9472',
      longitude: '-37.0731',
      status: 'ACTIVE',
    },
    create: {
      id: CITY_ID,
      name: 'Aracaju',
      latitude: '-10.9472',
      longitude: '-37.0731',
      status: 'ACTIVE',
    },
  });

  const users: Record<string, { id: string; name: string; surname: string }> =
    {};
  for (const u of USERS) {
    const data = {
      name: u.name,
      surname: u.surname,
      password: passwordHash,
      cpf: u.cpf,
      cityId: city.id,
      role: u.role,
    };
    users[u.key] = await prisma.user.upsert({
      // Match by CPF so changing a demo email updates the user instead of colliding.
      where: { cpf: u.cpf },
      update: { ...data, email: u.email },
      create: { ...data, email: u.email },
    });
  }

  // Reset the demo city: drop issues created during demos and the old seed issues.
  const keep = ISSUES.map(([suffix]) => issueId(suffix));
  await prisma.issue.deleteMany({
    where: { cityId: city.id, id: { notIn: keep } },
  });

  const now = Date.now();
  const hour = 60 * 60 * 1000;
  const manager = users.roberto;

  for (const [
    suffix,
    reporterKey,
    fiscalKey,
    stage,
    daysAgo,
    latitude,
    longitude,
    category,
    type,
    description,
    photo,
    comment,
  ] of ISSUES) {
    const id = issueId(suffix);
    const reporter = users[reporterKey];
    const fiscal = fiscalKey ? users[fiscalKey] : null;
    const createdAt = new Date(now - daysAgo * 24 * hour - 3 * hour);
    const order: Stage[] = [
      'reported',
      'fiscal',
      'validated',
      'in_progress',
      'resolution',
      'solved',
    ];
    const reached = (s: Stage) =>
      stage !== 'closed' && order.indexOf(stage) >= order.indexOf(s);

    const history: {
      user: { id: string; name: string; surname: string };
      action: IssueHistoryAction;
      description?: string;
    }[] = [{ user: reporter, action: 'REPORTED_ISSUE' }];
    if (fiscal) history.push({ user: fiscal, action: 'ASSIGNED_AS_FISCAL' });
    if (stage === 'closed')
      history.push({
        user: fiscal!,
        action: 'MARKED_AS_UNFOUNDED',
        description:
          'Estive no local: a pintura já tinha sido removida pela prefeitura.',
      });
    if (reached('validated'))
      history.push({
        user: fiscal!,
        action: 'MARKED_AS_VALID',
        description: 'Estive no local e confirmo o problema.',
      });
    if (reached('in_progress'))
      history.push({ user: manager, action: 'ASSIGNED_AS_MANAGER' });
    if (reached('resolution'))
      history.push({
        user: manager,
        action: 'ADDED_RESOLUTION',
        description: 'Equipe enviada ao local e serviço executado.',
      });
    if (reached('solved'))
      history.push({
        user: reporter,
        action: 'MARKED_AS_SOLVED',
        description: 'Confirmo que foi resolvido. Obrigado!',
      });

    // The last history step is the time the issue entered its current status (drives the 3-day rule).
    const lastStepAt = new Date(
      createdAt.getTime() + (history.length - 1) * 5 * hour,
    );

    const data = {
      status: STATUS[stage],
      cityId: city.id,
      latitude,
      longitude,
      category,
      type,
      description,
      reporterId: reporter.id,
      fiscalId: fiscal?.id ?? null,
      managerId: reached('in_progress') ? manager.id : null,
      createdAt,
      updatedAt: lastStepAt,
    };
    await prisma.issue.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });

    await prisma.issueHistory.deleteMany({ where: { issueId: id } });
    await prisma.issueHistory.createMany({
      data: history.map((h, i) => ({
        issueId: id,
        userId: h.user.id,
        userName: fullName(h.user),
        action: h.action,
        description: h.description,
        createdAt: new Date(createdAt.getTime() + i * 5 * hour),
        updatedAt: new Date(createdAt.getTime() + i * 5 * hour),
      })),
    });

    await prisma.issuePhoto.deleteMany({ where: { issueId: id } });
    if (photo)
      await prisma.issuePhoto.create({ data: { issueId: id, url: photo } });

    await prisma.comment.deleteMany({ where: { issueId: id } });
    if (comment) {
      await prisma.comment.create({
        data: {
          text: comment,
          issueId: id,
          cityId: city.id,
          authorId: (fiscal ?? reporter).id,
          createdAt: new Date(createdAt.getTime() + 2 * hour),
        },
      });
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
