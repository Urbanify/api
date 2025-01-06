import { Injectable } from '@nestjs/common';
import { env } from '@shared/env';
import Mailgun from 'mailgun.js';
import { IMailgunClient } from 'mailgun.js/Interfaces';
import { SendMailDto } from '../mail.dto';
import { templates } from '../templates';

@Injectable()
export class MailgunService {
  private client: IMailgunClient;

  constructor() {
    const mailgun = new Mailgun(FormData);

    this.client = mailgun.client({
      username: 'api',
      key: env.mailgunKey,
    });
  }

  public async send(input: SendMailDto): Promise<void> {
    try {
      const templateBuild = templates[input.template];

      const template = templateBuild(input.payload);

      await this.client.messages.create(env.mailgunUrl, {
        from: env.mailServiceFrom,
        to: input.to,
        subject: input.subject,
        html: template,
      });
    } catch (error) {
      console.log('🚀 ~ failed to send email - error:', error);
    }
  }
}
