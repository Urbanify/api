import { Module } from '@nestjs/common';

import { MailService } from './mail.service';
import { MailgunService } from './mailgun/mailgun.service';

@Module({
  providers: [MailgunService, MailService],
  exports: [MailService],
})
export class MailModule {}
