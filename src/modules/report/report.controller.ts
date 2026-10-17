import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActiveUser, UserType } from '@shared/decorators/active-user.decorator';
import { AuthValidationInterceptor } from '@shared/interceptors/auth.interceptor';

import { CreateReportDto } from './dto/create-report.dto';
import { ReportService } from './report.service';

@ApiTags('Reports')
@UseInterceptors(AuthValidationInterceptor)
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Report an issue or a comment for moderation' })
  async create(
    @Body() createReportDto: CreateReportDto,
    @ActiveUser() userType: UserType,
  ) {
    await this.reportService.create(userType, createReportDto);
  }
}
