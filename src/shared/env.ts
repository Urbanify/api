import { plainToInstance } from 'class-transformer';
import { IsOptional, IsString, validateSync } from 'class-validator';

class Env {
  @IsString()
  port: string;

  @IsString()
  jwtSecret: string;

  @IsString()
  databaseUrl: string;

  @IsString()
  apiKey: string;

  @IsString()
  resendApiKey: string;

  @IsString()
  mailServiceFrom: string;

  @IsString()
  frontendUrl: string;

  @IsOptional()
  @IsString()
  sheetsWebhookUrl?: string;

  @IsOptional()
  @IsString()
  expoAccessToken?: string;
}

export const env: Env = plainToInstance(Env, {
  port: process.env.SERVER_PORT ?? process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
  apiKey: process.env.API_KEY,
  resendApiKey: process.env.RESEND_API_KEY ?? '',
  mailServiceFrom:
    process.env.MAIL_SERVICE_FROM ?? 'Urbanify <noreply@urbanify.com.br>',
  frontendUrl: process.env.FRONTEND_URL,
  sheetsWebhookUrl: process.env.SHEETS_WEBHOOK_URL,
  expoAccessToken: process.env.EXPO_ACCESS_TOKEN,
});

const errors = validateSync(env);
console.log(errors);
