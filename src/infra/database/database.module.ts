import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma/prisma.service';
import { FeatureFlagRepository } from './prisma/repositories/feature-flag/feature-flag.repository';
import { UserRepository } from './prisma/repositories/user/user.repository';

@Global()
@Module({
  providers: [PrismaService, UserRepository, FeatureFlagRepository],
  exports: [PrismaService, UserRepository, FeatureFlagRepository],
})
export class DatabaseModule {}
