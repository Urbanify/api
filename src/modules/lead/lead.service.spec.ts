import { MailService } from '@infra/mail/mail.service';
import { BadRequestException, HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import {
  CreateResellerLeadDto,
  ResellerExperience,
} from './dto/create-reseller-lead.dto';
import { LeadService } from './lead.service';

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

describe('LeadService', () => {
  let service: LeadService;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadService,
        { provide: MailService, useValue: { send: jest.fn() } },
      ],
    }).compile();

    service = module.get(LeadService);
    mailService = module.get(MailService);
  });

  it('sends one email to the sales inbox with the answers and the candidate as reply-to', async () => {
    await service.submitResellerLead(validLead, '1.1.1.1');

    expect(mailService.send).toHaveBeenCalledTimes(1);
    expect(mailService.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'contato@urbanify.com.br',
        subject: 'Novo candidato a revendedor: Teste Ltda',
        replyTo: 'teste@example.com',
      }),
    );
  });

  it('escapes HTML in every answer', async () => {
    await service.submitResellerLead(
      {
        ...validLead,
        name: '<img src=x onerror=alert(1)>',
        message: '"a" & <b>',
      },
      '1.1.1.1',
    );

    const { html, text } = (mailService.send as jest.Mock).mock.calls[0][0];
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('&quot;a&quot; &amp; &lt;b&gt;');
    expect(html).not.toContain('<img');
    expect(text).toContain('Nome: <img src=x onerror=alert(1)>');
  });

  it('does nothing when the honeypot is filled', async () => {
    await service.submitResellerLead(
      { ...validLead, website: 'http://spam.example' },
      '1.1.1.1',
    );

    expect(mailService.send).not.toHaveBeenCalled();
  });

  it('rejects a CNPJ with wrong check digits and sends nothing', async () => {
    await expect(
      service.submitResellerLead(
        { ...validLead, cnpj: '11222333000182' },
        '1.1.1.1',
      ),
    ).rejects.toThrow(BadRequestException);

    expect(mailService.send).not.toHaveBeenCalled();
  });

  it('allows 5 applications per IP per hour and then answers 429', async () => {
    for (let i = 0; i < 5; i++) {
      await service.submitResellerLead(validLead, '2.2.2.2');
    }

    await expect(
      service.submitResellerLead(validLead, '2.2.2.2'),
    ).rejects.toThrow(HttpException);
    expect(mailService.send).toHaveBeenCalledTimes(5);

    await service.submitResellerLead(validLead, '3.3.3.3');
    expect(mailService.send).toHaveBeenCalledTimes(6);
  });
});
