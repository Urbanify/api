import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma/prisma.service';
import { CityRepository } from './prisma/repositories/city/city.repository';
import { CommentRepository } from './prisma/repositories/comment/comment.repository';
import { FeatureFlagRepository } from './prisma/repositories/feature-flag/feature-flag.repository';
import { IssueRepository } from './prisma/repositories/issue/issue.repository';
import { LoginCodeRepository } from './prisma/repositories/login-code/login-code.repository';
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
  ],
  exports: [
    PrismaService,
    UserRepository,
    FeatureFlagRepository,
    CityRepository,
    IssueRepository,
    CommentRepository,
    LoginCodeRepository,
  ],
})
export class DatabaseModule {}
