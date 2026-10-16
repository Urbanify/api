import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

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
}
