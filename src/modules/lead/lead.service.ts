import { MailService } from '@infra/mail/mail.service';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { isValidCnpj } from '@shared/cnpj';

import {
  CreateResellerLeadDto,
  ResellerExperience,
} from './dto/create-reseller-lead.dto';

const LEADS_INBOX = 'contato@urbanify.com.br';
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

const experienceLabels: Record<ResellerExperience, string> = {
  [ResellerExperience.NONE]: 'Nenhuma',
  [ResellerExperience.SOME]: 'Alguma',
  [ResellerExperience.STRONG]: 'Forte',
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildAnswers(dto: CreateResellerLeadDto) {
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

// ponytail: fixed window per IP, in memory. Holds for one instance only; move it to
// Postgres or Redis before running a second API machine.
@Injectable()
export class LeadService {
  private readonly hits = new Map<string, { count: number; resetAt: number }>();

  constructor(private readonly mailService: MailService) {}

  async submitResellerLead(
    dto: CreateResellerLeadDto,
    ip: string,
  ): Promise<void> {
    if (dto.website) {
      return;
    }

    this.consumeRateLimit(ip);

    if (!isValidCnpj(dto.cnpj)) {
      throw new BadRequestException('invalid cnpj');
    }

    const answers = buildAnswers(dto);

    await this.mailService.send({
      to: LEADS_INBOX,
      subject: `Novo candidato a revendedor: ${dto.company}`,
      replyTo: dto.email,
      html: `<table>${answers
        .map(
          ([label, value]) =>
            `<tr><th align="left" valign="top">${escapeHtml(label)}</th><td style="white-space: pre-wrap;">${escapeHtml(value)}</td></tr>`,
        )
        .join('')}</table>`,
      text: answers.map(([label, value]) => `${label}: ${value}`).join('\n'),
    });
  }

  private consumeRateLimit(ip: string): void {
    const now = Date.now();
    const hit = this.hits.get(ip);

    if (!hit || hit.resetAt <= now) {
      this.hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
      return;
    }

    if (hit.count >= RATE_LIMIT) {
      throw new HttpException(
        'too many applications, try again later',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    hit.count += 1;
  }
}
