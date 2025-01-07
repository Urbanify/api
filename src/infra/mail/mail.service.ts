import { Injectable } from '@nestjs/common';

import { SendMailDto } from './mail.dto';
import { MailgunService } from './mailgun/mailgun.service';

@Injectable()
export class MailService {
  constructor(private readonly mailgunService: MailgunService) {}

  public async send(input: SendMailDto): Promise<void> {
    return this.mailgunService.send(input);
  }
}
