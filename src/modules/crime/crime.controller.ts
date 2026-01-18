import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthValidationInterceptor } from '@shared/interceptors/auth.interceptor';
import { ManagerOwnerAdminValidationInterceptor } from '@shared/interceptors/manager-owner-admin.interceptor';

import { CrimeService } from './crime.service';
import { CreateCrimeDto } from './dto/create-crime.dto';
import {
  ListCrimeResponseDto,
  ListCrimesFilterDto,
} from './dto/list-crimes.dto';

@ApiTags('Crime')
@Controller('crimes')
export class CrimeController {
  constructor(private readonly crimeService: CrimeService) {}

  @Post()
  @ApiOperation({ summary: 'Report a new crime' })
  @ApiResponse({ status: 201, description: 'Crime reported successfully' })
  @UseInterceptors(AuthValidationInterceptor)
  create(@Body() createCrimeDto: CreateCrimeDto) {
    return this.crimeService.create(createCrimeDto);
  }

  @Get()
  @ApiOperation({ summary: 'List reported crimes' })
  @ApiResponse({ status: 200, type: ListCrimeResponseDto })
  @UseInterceptors(ManagerOwnerAdminValidationInterceptor)
  list(@Query() filter: ListCrimesFilterDto) {
    return this.crimeService.list(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get crime details' })
  @ApiResponse({ status: 200, description: 'Return the crime details' })
  @ApiResponse({ status: 404, description: 'Crime not found' })
  @UseInterceptors(ManagerOwnerAdminValidationInterceptor)
  getById(@Param('id') id: string) {
    return this.crimeService.getById(id);
  }
}
