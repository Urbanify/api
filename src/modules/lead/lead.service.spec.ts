import { MailService } from '@infra/mail/mail.service';
import { BadRequestException, HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { env } from '@shared/env';

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
import { LeadService } from './lead.service';
import { SheetsService } from './sheets.service';

const PROTOCOL = /^OPP-\d{8}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/;

const validLead: CreateResellerLeadDto = {
  name: 'Ana Souza',
  email: 'teste@example.com',
  phone: '11987654321',
  company: 'Teste Ltda',
  cnpj: '11222333000181',
  region: 'Sergipe, SE',
  citiesOfInterest: 'Aracaju, Lagarto',
  experience: ResellerExperience.SOME,
  howHeard: 'Indicação',
  message: 'Tenho contatos na região.',
  consent: true,
};

const validOpportunity: CreateOpportunityDto = {
  resellerEmail: 'teste@example.com',
  company: 'Teste Ltda',
  type: OpportunityType.NEW,
  city: 'Aracaju',
  uf: 'SE',
  contactRole: 'Chefe de gabinete',
  stage: OpportunityStage.MEETING_DONE,
  path: ContractPath.WAIVER,
  notes: '',
};

describe('LeadService', () => {
  let service: LeadService;
  let mailService: MailService;
  let sheetsService: SheetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadService,
        { provide: MailService, useValue: { send: jest.fn() } },
        { provide: SheetsService, useValue: { append: jest.fn() } },
      ],
    }).compile();

    service = module.get(LeadService);
    mailService = module.get(MailService);
    sheetsService = module.get(SheetsService);
  });

  afterEach(() => {
    env.sheetsWebhookUrl = undefined;
    jest.restoreAllMocks();
  });

  it('sends one email to the sales inbox with the answers and the candidate as reply-to', async () => {
    await service.submitResellerLead(validLead);

    expect(mailService.send).toHaveBeenCalledTimes(1);
    expect(mailService.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'contato@urbanify.com.br',
        subject: 'Novo candidato a revendedor: Teste Ltda',
        replyTo: 'teste@example.com',
      }),
    );
  });

  it('appends the candidate to the Candidatos tab after the email', async () => {
    await service.submitResellerLead(validLead);

    expect(sheetsService.append).toHaveBeenCalledWith('Candidatos', [
      null,
      'Ana Souza',
      'teste@example.com',
      '11987654321',
      'Teste Ltda',
      '11222333000181',
      'Sergipe, SE',
      'Aracaju, Lagarto',
      'Alguma',
      'Indicação',
      'Tenho contatos na região.',
    ]);
  });

  it('escapes HTML in every answer', async () => {
    await service.submitResellerLead({
      ...validLead,
      name: '<img src=x onerror=alert(1)>',
      message: '"a" & <b>',
    });

    const { html, text } = (mailService.send as jest.Mock).mock.calls[0][0];
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('&quot;a&quot; &amp; &lt;b&gt;');
    expect(html).not.toContain('<img');
    expect(text).toContain('Nome: <img src=x onerror=alert(1)>');
  });

  it('does nothing when the honeypot is filled', async () => {
    await service.submitResellerLead({
      ...validLead,
      website: 'http://spam.example',
    });

    expect(mailService.send).not.toHaveBeenCalled();
    expect(sheetsService.append).not.toHaveBeenCalled();
  });

  it('rejects a CNPJ with wrong check digits and sends nothing', async () => {
    await expect(
      service.submitResellerLead({ ...validLead, cnpj: '11222333000182' }),
    ).rejects.toThrow(BadRequestException);

    expect(mailService.send).not.toHaveBeenCalled();
  });

  it('allows 5 applications per e-mail per hour and then answers 429', async () => {
    for (let i = 0; i < 5; i++) {
      await service.submitResellerLead(validLead);
    }

    await expect(service.submitResellerLead(validLead)).rejects.toThrow(
      HttpException,
    );
    expect(mailService.send).toHaveBeenCalledTimes(5);

    await service.submitResellerLead({
      ...validLead,
      email: 'outro@example.com',
    });
    expect(mailService.send).toHaveBeenCalledTimes(6);
  });

  describe('submitOpportunity', () => {
    it('emails the sales inbox and confirms to the reseller, then returns the protocol', async () => {
      const protocol = await service.submitOpportunity(validOpportunity);

      expect(protocol).toMatch(PROTOCOL);
      expect(mailService.send).toHaveBeenCalledTimes(2);
      expect(mailService.send).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          to: 'contato@urbanify.com.br',
          subject: `Oportunidade nova: Aracaju/SE · Teste Ltda · ${protocol}`,
          replyTo: 'teste@example.com',
        }),
      );
      expect(mailService.send).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          to: 'teste@example.com',
          subject: `Recebemos o registro ${protocol}`,
          text: `Recebemos o registro ${protocol}. A Urbanify confere em até 2 dias úteis e responde se a cidade ficou reservada por 90 dias.`,
        }),
      );
    });

    it('escapes HTML in the inbox table', async () => {
      await service.submitOpportunity({
        ...validOpportunity,
        company: '<b>Ltda</b>',
        notes: '"x" & <i>y</i>',
      });

      const { html } = (mailService.send as jest.Mock).mock.calls[0][0];
      expect(html).toContain('&lt;b&gt;Ltda&lt;/b&gt;');
      expect(html).toContain('&quot;x&quot; &amp; &lt;i&gt;y&lt;/i&gt;');
      expect(html).not.toContain('<b>');
      expect(html).not.toContain('<i>');
    });

    it('appends the row to the Oportunidades tab with pt-BR labels', async () => {
      const protocol = await service.submitOpportunity(validOpportunity);

      expect(sheetsService.append).toHaveBeenCalledWith('Oportunidades', [
        null,
        protocol,
        'nova',
        'teste@example.com',
        'Teste Ltda',
        'Aracaju',
        'SE',
        'Chefe de gabinete',
        'Reunião feita',
        'Dispensa',
        '',
      ]);
    });

    it('does nothing when the honeypot is filled, but answers like a real request', async () => {
      const protocol = await service.submitOpportunity({
        ...validOpportunity,
        website: 'http://spam.example',
      });

      expect(protocol).toMatch(PROTOCOL);
      expect(mailService.send).not.toHaveBeenCalled();
      expect(sheetsService.append).not.toHaveBeenCalled();
    });

    it('allows 10 opportunities per reseller e-mail per hour and then answers 429', async () => {
      for (let i = 0; i < 10; i++) {
        await service.submitOpportunity(validOpportunity);
      }

      await expect(service.submitOpportunity(validOpportunity)).rejects.toThrow(
        HttpException,
      );
      expect(mailService.send).toHaveBeenCalledTimes(20);

      await service.submitOpportunity({
        ...validOpportunity,
        resellerEmail: 'outro@example.com',
      });
      expect(mailService.send).toHaveBeenCalledTimes(22);
    });

    it('still answers with the protocol when the sheet is unreachable', async () => {
      env.sheetsWebhookUrl = 'https://script.example/exec';
      jest
        .spyOn(global, 'fetch')
        .mockRejectedValue(new TypeError('fetch failed'));
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LeadService,
          SheetsService,
          { provide: MailService, useValue: { send: jest.fn() } },
        ],
      }).compile();

      const protocol = await module
        .get(LeadService)
        .submitOpportunity(validOpportunity);

      expect(protocol).toMatch(PROTOCOL);
    });
  });
});
