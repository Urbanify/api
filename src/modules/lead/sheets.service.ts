import { Injectable, Logger } from '@nestjs/common';
import { env } from '@shared/env';

export type SheetTab = 'Oportunidades' | 'Candidatos';

const TIMEOUT_MS = 10_000;

// Appends a row to the internal Google Sheet through the Apps Script web app. Best effort: a sheet
// outage must not fail the request, so this never throws. The URL is never logged.
@Injectable()
export class SheetsService {
  private readonly logger = new Logger(SheetsService.name);

  async append(tab: SheetTab, row: (string | null)[]): Promise<void> {
    if (!env.sheetsWebhookUrl) {
      this.logger.warn(`SHEETS_WEBHOOK_URL not set, row for ${tab} not sent`);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      // Apps Script answers POST with a 302 to googleusercontent; fetch follows it to the result.
      const response = await fetch(env.sheetsWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tab, row }),
        redirect: 'follow',
        signal: controller.signal,
      });

      if (!response.ok) {
        this.logger.error(`Sheets responded ${response.status} for ${tab}`);
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'unknown error';
      this.logger.error(`Sheets append failed for ${tab}: ${reason}`);
    } finally {
      clearTimeout(timer);
    }
  }
}
