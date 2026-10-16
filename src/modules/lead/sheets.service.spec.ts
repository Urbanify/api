import { Logger } from '@nestjs/common';
import { env } from '@shared/env';

import { SheetsService } from './sheets.service';

const WEBHOOK = 'https://script.example/exec';

describe('SheetsService', () => {
  let service: SheetsService;

  beforeEach(() => {
    service = new SheetsService();
  });

  afterEach(() => {
    env.sheetsWebhookUrl = undefined;
    jest.restoreAllMocks();
  });

  it('skips the request when SHEETS_WEBHOOK_URL is empty', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');

    await expect(
      service.append('Candidatos', [null, 'Ana']),
    ).resolves.toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('posts the tab and the row as JSON to the webhook', async () => {
    env.sheetsWebhookUrl = WEBHOOK;
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({ ok: true } as Response);

    await service.append('Oportunidades', [null, 'OPP-20261016-ABCD']);

    expect(fetchSpy).toHaveBeenCalledWith(
      WEBHOOK,
      expect.objectContaining({
        method: 'POST',
        redirect: 'follow',
        body: JSON.stringify({
          tab: 'Oportunidades',
          row: [null, 'OPP-20261016-ABCD'],
        }),
      }),
    );
  });

  it('never throws, and does not log the URL, when the request fails', async () => {
    env.sheetsWebhookUrl = WEBHOOK;
    const errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    jest
      .spyOn(global, 'fetch')
      .mockRejectedValueOnce(new TypeError('fetch failed'));

    await expect(service.append('Candidatos', [null])).resolves.toBeUndefined();

    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({ ok: false, status: 500 } as Response);
    await expect(service.append('Candidatos', [null])).resolves.toBeUndefined();

    expect(errorSpy).toHaveBeenCalledTimes(2);
    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('script.example'),
    );
  });
});
