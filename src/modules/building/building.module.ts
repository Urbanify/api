import { Module } from '@nestjs/common';

import { BuildingController } from './building.controller';
import { BuildingService } from './building.service';
import { BuildingRepository } from '../../infra/database/prisma/repositories/building/building.repository';

@Module({
  controllers: [BuildingController],
  providers: [BuildingService, BuildingRepository],
})
export class BuildingModule {}
