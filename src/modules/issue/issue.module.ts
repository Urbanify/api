import { PushModule } from '@modules/push/push.module';
import { Module } from '@nestjs/common';

import { IssueController } from './issue.controller';
import { IssueService } from './issue.service';

@Module({
  imports: [PushModule],
  controllers: [IssueController],
  providers: [IssueService],
})
export class IssueModule {}
