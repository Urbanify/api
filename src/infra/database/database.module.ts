import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma/prisma.service';
import { CityRepository } from './prisma/repositories/city/city.repository';
import { FeatureFlagRepository } from './prisma/repositories/feature-flag/feature-flag.repository';
import { IssueRepository } from './prisma/repositories/issue/issue.repository';
import { UserRepository } from './prisma/repositories/user/user.repository';

@Global()
@Module({
  providers: [
    PrismaService,
    UserRepository,
    FeatureFlagRepository,
    CityRepository,
    IssueRepository,
  ],
  exports: [
    PrismaService,
    UserRepository,
    FeatureFlagRepository,
    CityRepository,
    IssueRepository,
  ],
})
export class DatabaseModule {}
