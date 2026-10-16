import { MailService } from '@infra/mail/mail.service';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { isValidCnpj } from '@shared/cnpj';
import { randomInt } from 'node:crypto';

import {
  ContractPath,
  CreateOpportunityDto,
  OpportunityStage,
  OpportunityType,
} from './dto/create-opportunity.dto';
import {
  CreateResellerLeadDto,
  ResellerExperience,
} from './dto/create-reseller-lead.dto';
import { SheetsService } from './sheets.service';

const LEADS_INBOX = 'contato@urbanify.com.br';
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RESELLER_LIMIT = 5;
const OPPORTUNITY_LIMIT = 10;
// No 0, O, 1 or I: the protocol is read aloud and typed back by people.
const PROTOCOL_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

type Row = [string, string];

const experienceLabels: Record<ResellerExperience, string> = {
  [ResellerExperience.NONE]: 'Nenhuma',
  [ResellerExperience.SOME]: 'Alguma',
  [ResellerExperience.STRONG]: 'Forte',
};

const typeLabels: Record<OpportunityType, string> = {
  [OpportunityType.NEW]: 'nova',
  [OpportunityType.UPDATE]: 'atualização',
};

const stageLabels: Record<OpportunityStage, string> = {
  [OpportunityStage.FIRST_CONTACT]: 'Primeiro contato',
  [OpportunityStage.MEETING_SCHEDULED]: 'Reunião marcada',
  [OpportunityStage.MEETING_DONE]: 'Reunião feita',
  [OpportunityStage.PROPOSAL_SENT]: 'Proposta enviada',
  [OpportunityStage.PROCESS_OPEN]: 'Processo aberto',
  [OpportunityStage.CONTRACT_SIGNED]: 'Contrato assinado',
};

const pathLabels: Record<ContractPath, string> = {
  [ContractPath.WAIVER]: 'Dispensa',
  [ContractPath.TENDER]: 'Pregão',
  [ContractPath.DIRECT]: 'Inexigibilidade',
  [ContractPath.CPSI]: 'CPSI',
  [ContractPath.NOT_SURE]: 'Ainda não sei',
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function table(rows: Row[]): string {
  return `<table>${rows
    .map(
      ([label, value]) =>
        `<tr><th align="left" valign="top">${escapeHtml(label)}</th><td style="white-space: pre-wrap;">${escapeHtml(value)}</td></tr>`,
    )
    .join('')}</table>`;
}

function toText(rows: Row[]): string {
  return rows.map(([label, value]) => `${label}: ${value}`).join('\n');
}

function buildAnswers(dto: CreateResellerLeadDto): Row[] {
  return [
    ['Nome', dto.name],
    ['E-mail', dto.email],
    ['Telefone', dto.phone],
    ['Razão social', dto.company],
    ['CNPJ', dto.cnpj],
    ['Região de atuação', dto.region],
    ['Cidades de interesse', dto.citiesOfInterest || '-'],
    ['Experiência com prefeituras', experienceLabels[dto.experience]],
    ['Como nos conheceu', dto.howHeard || '-'],
    ['Mensagem', dto.message || '-'],
  ];
}

// Format OPP-YYYYMMDD-XXXX, with the date in Brazil time.
function createProtocol(now = new Date()): string {
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
  })
    .format(now)
    .replace(/-/g, '');
  const suffix = Array.from(
    { length: 4 },
    () => PROTOCOL_ALPHABET[randomInt(PROTOCOL_ALPHABET.length)],
  ).join('');

  return `OPP-${date}-${suffix}`;
}

// ponytail: fixed window per e-mail, in memory. Holds for one instance only; move it to
// Postgres or Redis before running a second API machine.
@Injectable()
export class LeadService {
  private readonly hits = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly mailService: MailService,
    private readonly sheetsService: SheetsService,
  ) {}

  async submitResellerLead(dto: CreateResellerLeadDto): Promise<void> {
    if (dto.website) {
      return;
    }

    // Keyed by e-mail: every request arrives from the web server, so the client IP is not useful.
    this.consumeRateLimit(
      `reseller:${dto.email.trim().toLowerCase()}`,
      RESELLER_LIMIT,
    );

    if (!isValidCnpj(dto.cnpj)) {
      throw new BadRequestException('invalid cnpj');
    }

    const answers = buildAnswers(dto);

    await this.mailService.send({
      to: LEADS_INBOX,
      subject: `Novo candidato a revendedor: ${dto.company}`,
      replyTo: dto.email,
      html: table(answers),
      text: toText(answers),
    });

    await this.sheetsService.append('Candidatos', [
      null,
      dto.name,
      dto.email,
      dto.phone,
      dto.company,
      dto.cnpj,
      dto.region,
      dto.citiesOfInterest ?? '',
      experienceLabels[dto.experience],
      dto.howHeard ?? '',
      dto.message ?? '',
    ]);
  }

  async submitOpportunity(dto: CreateOpportunityDto): Promise<string> {
    const protocol = createProtocol();

    if (dto.website) {
      return protocol;
    }

    this.consumeRateLimit(
      `opportunity:${dto.resellerEmail.trim().toLowerCase()}`,
      OPPORTUNITY_LIMIT,
    );

    const rows: Row[] = [
      ['Protocolo', protocol],
      ['Tipo', typeLabels[dto.type]],
      ['E-mail do revendedor', dto.resellerEmail],
      ['Empresa', dto.company],
      ['Cidade', dto.city],
      ['UF', dto.uf],
      ['Contato na prefeitura (cargo)', dto.contactRole],
      ['Estágio', stageLabels[dto.stage]],
      ['Caminho de contratação', pathLabels[dto.path]],
      ['Observações', dto.notes || '-'],
    ];

    await this.mailService.send({
      to: LEADS_INBOX,
      subject: `Oportunidade ${typeLabels[dto.type]}: ${dto.city}/${dto.uf} · ${dto.company} · ${protocol}`,
      replyTo: dto.resellerEmail,
      html: table(rows),
      text: toText(rows),
    });

    const confirmation = `Recebemos o registro ${protocol}. A Urbanify confere em até 2 dias úteis e responde se a cidade ficou reservada por 90 dias.`;

    await this.mailService.send({
      to: dto.resellerEmail,
      subject: `Recebemos o registro ${protocol}`,
      replyTo: LEADS_INBOX,
      html: `<p>${escapeHtml(confirmation)}</p>`,
      text: confirmation,
    });

    await this.sheetsService.append('Oportunidades', [
      null,
      protocol,
      typeLabels[dto.type],
      dto.resellerEmail,
      dto.company,
      dto.city,
      dto.uf,
      dto.contactRole,
      stageLabels[dto.stage],
      pathLabels[dto.path],
      dto.notes ?? '',
    ]);

    return protocol;
  }

  private consumeRateLimit(key: string, limit: number): void {
    const now = Date.now();
    const hit = this.hits.get(key);

    if (!hit || hit.resetAt <= now) {
      this.hits.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
      return;
    }

    if (hit.count >= limit) {
      throw new HttpException(
        'too many requests, try again later',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    hit.count += 1;
  }
}
