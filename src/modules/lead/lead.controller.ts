import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { CreateResellerLeadDto } from './dto/create-reseller-lead.dto';
import { LeadService } from './lead.service';

@Controller('leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post('reseller')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Send a reseller application to the sales inbox' })
  async submitReseller(@Body() createResellerLeadDto: CreateResellerLeadDto) {
    await this.leadService.submitResellerLead(createResellerLeadDto);
    return { ok: true };
  }

  @Post('opportunity')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary:
      'Register a sales opportunity for the conference and the 90-day reservation',
  })
  async submitOpportunity(@Body() createOpportunityDto: CreateOpportunityDto) {
    const protocol =
      await this.leadService.submitOpportunity(createOpportunityDto);
    return { ok: true, protocol };
  }
}
