import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { CreateFeatureFlagDto } from './dto/create-feature-flag.dto';
import { FeatureFlagService } from './feature-flag.service';
import { FeatureFlagValidationInterceptor } from './interceptors/feature-flag.interceptor';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';

@UseInterceptors(FeatureFlagValidationInterceptor)
@Controller('feature-flags')
export class FeatureFlagController {
  constructor(private readonly featureFlagService: FeatureFlagService) {}

  @Post()
  create(@Body() createFeatureFlagDto: CreateFeatureFlagDto) {
    return this.featureFlagService.create(createFeatureFlagDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFeatureFlagDto: UpdateFeatureFlagDto,
  ) {
    return this.featureFlagService.update(id, updateFeatureFlagDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string) {
    return this.featureFlagService.delete(id);
  }
}
