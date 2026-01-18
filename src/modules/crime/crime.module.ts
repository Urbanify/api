import { CrimeRepository } from '@infra/database/prisma/repositories/crime/crime.repository';
import { Module } from '@nestjs/common';

import { CrimeController } from './crime.controller';
import { CrimeService } from './crime.service';

@Module({
  controllers: [CrimeController],
  providers: [CrimeService, CrimeRepository],
})
export class CrimeModule {}
