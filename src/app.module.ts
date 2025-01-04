import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './infra/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { FeatureFlagModule } from './modules/feature-flag/feature-flag.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    FeatureFlagModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
