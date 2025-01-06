import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ActiveUser, UserType } from '@shared/decorators/active-user.decorator';
import { AdminValidationInterceptor } from '@shared/interceptors/admin.interceptor';
import { AuthValidationInterceptor } from '@shared/interceptors/auth.interceptor';

import { CityService } from './city.service';
import { CreateCityDto } from './dto/create-city.dto';
import { GetCityByIdResponseDto } from './dto/get-city-by-id.dto';
import { ListCitiesResponseDto } from './dto/list-cities.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Post()
  @UseInterceptors(AdminValidationInterceptor)
  @ApiOperation({ summary: 'Create a city' })
  create(@Body() createCityDto: CreateCityDto) {
    return this.cityService.create(createCityDto);
  }

  @Post(':id/deactivate')
  @UseInterceptors(AdminValidationInterceptor)
  @ApiOperation({ summary: 'Deactivate a city' })
  deactivate(@Param('id') id: string) {
    return this.cityService.deactivate(id);
  }

  @Put(':id')
  @UseInterceptors(AdminValidationInterceptor)
  @ApiOperation({ summary: 'Update a city' })
  udpate(@Param('id') id: string, @Body() updateCityDto: UpdateCityDto) {
    return this.cityService.update(id, updateCityDto);
  }

  @Get()
  @ApiOperation({ summary: 'List available cities' })
  @ApiResponse({ type: [ListCitiesResponseDto] })
  list() {
    return this.cityService.list();
  }

  @Get(':id')
  @UseInterceptors(AuthValidationInterceptor)
  @ApiOperation({ summary: 'Get a city by id' })
  @ApiResponse({ type: GetCityByIdResponseDto })
  getById(@Param('id') id: string) {
    return this.cityService.getById(id);
  }

  @Post(':id/access')
  @UseInterceptors(AdminValidationInterceptor)
  @ApiOperation({ summary: 'Access a city' })
  access(@Param('id') id: string, @ActiveUser() user: UserType) {
    return this.cityService.access(id, user);
  }
}
