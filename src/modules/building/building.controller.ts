import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BuildingStatus } from '@prisma/client';

import { BuildingService } from './building.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { AuthValidationInterceptor } from '../../shared/interceptors/auth.interceptor';
import { ManagerOwnerAdminValidationInterceptor } from '../../shared/interceptors/manager-owner-admin.interceptor';

@ApiTags('Buildings')
@ApiBearerAuth()
@Controller('buildings')
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  @Post()
  @UseInterceptors(ManagerOwnerAdminValidationInterceptor)
  @ApiOperation({ summary: 'Create a new building' })
  @ApiResponse({ status: 201, description: 'Created building object.' })
  @ApiResponse({ status: 403, description: 'Forbidden (Invalid role).' })
  @ApiBody({ type: CreateBuildingDto })
  create(@Body() createBuildingDto: CreateBuildingDto) {
    return this.buildingService.create(createBuildingDto);
  }

  @Get()
  @UseInterceptors(AuthValidationInterceptor)
  @ApiOperation({ summary: 'List all buildings' })
  @ApiResponse({ status: 200, description: 'Array of building objects.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiQuery({ name: 'status', enum: BuildingStatus, required: false })
  findAll(@Query('status') status?: BuildingStatus) {
    return this.buildingService.findAll(status);
  }

  @Get(':id')
  @UseInterceptors(AuthValidationInterceptor)
  @ApiOperation({ summary: 'Get building details' })
  @ApiResponse({ status: 200, description: 'Building object.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findOne(@Param('id') id: string) {
    return this.buildingService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(ManagerOwnerAdminValidationInterceptor)
  @ApiOperation({ summary: 'Update a building' })
  @ApiResponse({ status: 200, description: 'Updated building object.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiBody({ type: UpdateBuildingDto })
  update(
    @Param('id') id: string,
    @Body() updateBuildingDto: UpdateBuildingDto,
  ) {
    return this.buildingService.update(id, updateBuildingDto);
  }
}
