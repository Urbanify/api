import { MailModule } from '@infra/mail/mail.module';
import { Module } from '@nestjs/common';

import { LeadController } from './lead.controller';
import { LeadService } from './lead.service';
import { SheetsService } from './sheets.service';

@Module({
  imports: [MailModule],
  controllers: [LeadController],
  providers: [LeadService, SheetsService],
})
export class LeadModule {}
