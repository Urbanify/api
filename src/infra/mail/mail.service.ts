import { Injectable } from '@nestjs/common';
import { env } from '@shared/env';

import { SendMailDto } from './mail.dto';

@Injectable()
export class MailService {
  public async send(input: SendMailDto): Promise<void> {
    if (!env.resendApiKey) {
      console.warn(
        `[mail] RESEND_API_KEY not set, email to ${input.to} not sent`,
      );
      return;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.mailServiceFrom,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
        reply_to: input.replyTo,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Resend responded ${response.status}: ${await response.text()}`,
      );
    }
  }
}
