import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { CreateFeatureFlagDto } from './dto/create-feature-flag.dto';
import { ListFeatureFlagsResponseDto } from './dto/list-feature-flags.dto';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';
import { FeatureFlagService } from './feature-flag.service';
import { AdminValidationInterceptor } from '../../shared/interceptors/admin.interceptor';

@UseInterceptors(AdminValidationInterceptor)
@Controller('feature-flags')
export class FeatureFlagController {
  constructor(private readonly featureFlagService: FeatureFlagService) {}

  @Post()
  @ApiOperation({ summary: 'Create a feature flag' })
  create(@Body() createFeatureFlagDto: CreateFeatureFlagDto) {
    return this.featureFlagService.create(createFeatureFlagDto);
  }

  @Get()
  @ApiOperation({ summary: 'List feature flags' })
  @ApiResponse({ type: [ListFeatureFlagsResponseDto] })
  list() {
    return this.featureFlagService.list();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a feature flag' })
  update(
    @Param('id') id: string,
    @Body() updateFeatureFlagDto: UpdateFeatureFlagDto,
  ) {
    return this.featureFlagService.update(id, updateFeatureFlagDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a feature flag' })
  delete(@Param('id') id: string) {
    return this.featureFlagService.delete(id);
  }
}
