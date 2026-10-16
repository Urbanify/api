import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma/prisma.service';
import { CityRepository } from './prisma/repositories/city/city.repository';
import { CommentRepository } from './prisma/repositories/comment/comment.repository';
import { DeviceTokenRepository } from './prisma/repositories/device-token/device-token.repository';
import { FeatureFlagRepository } from './prisma/repositories/feature-flag/feature-flag.repository';
import { IssueRepository } from './prisma/repositories/issue/issue.repository';
import { LoginCodeRepository } from './prisma/repositories/login-code/login-code.repository';
import { PlaceRepository } from './prisma/repositories/place/place.repository';
import { UserRepository } from './prisma/repositories/user/user.repository';

@Global()
@Module({
  providers: [
    PrismaService,
    UserRepository,
    FeatureFlagRepository,
    CityRepository,
    IssueRepository,
    CommentRepository,
    LoginCodeRepository,
    PlaceRepository,
    DeviceTokenRepository,
  ],
  exports: [
    PrismaService,
    UserRepository,
    FeatureFlagRepository,
    CityRepository,
    IssueRepository,
    CommentRepository,
    LoginCodeRepository,
    PlaceRepository,
    DeviceTokenRepository,
  ],
})
export class DatabaseModule {}
