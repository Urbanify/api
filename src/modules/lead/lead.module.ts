import { MailModule } from '@infra/mail/mail.module';
import { Module } from '@nestjs/common';

import { LeadController } from './lead.controller';
import { LeadService } from './lead.service';

@Module({
  imports: [MailModule],
  controllers: [LeadController],
  providers: [LeadService],
})
export class LeadModule {}
