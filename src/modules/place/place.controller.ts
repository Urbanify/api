import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActiveUser, UserType } from '@shared/decorators/active-user.decorator';

import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { PlaceStaffInterceptor } from './interceptors/place-staff.interceptor';
import { PlaceService } from './place.service';

@ApiTags('Places')
@Controller()
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  @Get('cities/:cityId/places')
  @ApiOperation({ summary: 'List the published places of a city (public)' })
  listPublic(@Param('cityId', ParseUUIDPipe) cityId: string) {
    return this.placeService.listPublic(cityId);
  }

  @Get('places')
  @UseInterceptors(PlaceStaffInterceptor)
  @ApiOperation({ summary: 'List all places of the city, including hidden' })
  listForStaff(@ActiveUser() userType: UserType) {
    return this.placeService.listForStaff(userType);
  }

  @Post('places')
  @UseInterceptors(PlaceStaffInterceptor)
  @ApiOperation({ summary: 'Create a place' })
  create(
    @ActiveUser() userType: UserType,
    @Body() createPlaceDto: CreatePlaceDto,
  ) {
    return this.placeService.create(userType, createPlaceDto);
  }

  @Patch('places/:id')
  @UseInterceptors(PlaceStaffInterceptor)
  @ApiOperation({ summary: 'Update a place' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @ActiveUser() userType: UserType,
    @Body() updatePlaceDto: UpdatePlaceDto,
  ) {
    return this.placeService.update(id, userType, updatePlaceDto);
  }

  @Delete('places/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseInterceptors(PlaceStaffInterceptor)
  @ApiOperation({ summary: 'Delete a place' })
  delete(
    @Param('id', ParseUUIDPipe) id: string,
    @ActiveUser() userType: UserType,
  ) {
    return this.placeService.delete(id, userType);
  }
}
