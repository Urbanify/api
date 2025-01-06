import { Module } from '@nestjs/common';
import { MailgunService } from './mailgun/mailgun.service';
import { MailService } from './mail.service';

@Module({
  providers: [MailgunService, MailService],
  exports: [MailService],
})
export class MailModule {}
