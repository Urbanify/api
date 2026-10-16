import { env } from '@shared/env';

import { MailService } from './mail.service';

describe('MailService', () => {
  const input = {
    to: 'john@doe.com',
    subject: 'Oi',
    html: '<p>Oi</p>',
    text: 'Oi',
  };

  beforeEach(() => {
    env.resendApiKey = 'test-key';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('posts the email to Resend with the API key', async () => {
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({ ok: true } as Response);

    await new MailService().send(input);

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-key',
        }),
        body: JSON.stringify({
          from: env.mailServiceFrom,
          to: ['john@doe.com'],
          subject: 'Oi',
          html: '<p>Oi</p>',
          text: 'Oi',
        }),
      }),
    );
  });

  it('sends reply_to when a reply address is given', async () => {
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({ ok: true } as Response);

    await new MailService().send({ ...input, replyTo: 'lead@example.com' });

    expect(JSON.parse(fetchSpy.mock.calls[0][1].body as string)).toEqual(
      expect.objectContaining({ reply_to: 'lead@example.com' }),
    );
  });

  it('throws when Resend responds with an error', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 422,
      text: () => Promise.resolve('invalid from'),
    } as Response);

    await expect(new MailService().send(input)).rejects.toThrow(
      'Resend responded 422: invalid from',
    );
  });
});
