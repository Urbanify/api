import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './infra/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { CityModule } from './modules/city/city.module';
import { FeatureFlagModule } from './modules/feature-flag/feature-flag.module';
import { IssueModule } from './modules/issue/issue.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
