import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';

import { CreateResellerLeadDto } from './dto/create-reseller-lead.dto';
import { LeadService } from './lead.service';

@Controller('leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post('reseller')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Send a reseller application to the sales inbox' })
  async submitReseller(
    @Req() req: Request,
    @Body() createResellerLeadDto: CreateResellerLeadDto,
  ) {
    // Behind Fly's proxy req.ip is the proxy, so the limit reads Fly's client IP header.
    const ip = req.get('fly-client-ip') ?? req.ip;
    await this.leadService.submitResellerLead(createResellerLeadDto, ip);
    return { ok: true };
  }
}
