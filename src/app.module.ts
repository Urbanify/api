import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './infra/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { BuildingModule } from './modules/building/building.module';
import { CityModule } from './modules/city/city.module';
import { CommentModule } from './modules/comment/comment.module';
import { CrimeModule } from './modules/crime/crime.module';
import { FeatureFlagModule } from './modules/feature-flag/feature-flag.module';
import { IssueModule } from './modules/issue/issue.module';
import { LeadModule } from './modules/lead/lead.module';
import { PlaceModule } from './modules/place/place.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    FeatureFlagModule,
    CityModule,
    IssueModule,
    CommentModule,
    UserModule,
    CrimeModule,
    BuildingModule,
    PlaceModule,
    LeadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
