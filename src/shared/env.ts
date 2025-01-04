import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsString, validateSync } from 'class-validator';

class Env {
  @IsString()
  @IsNotEmpty()
  port: string;

  @IsString()
  @IsNotEmpty()
  jwtSecret: string;

  @IsString()
  @IsNotEmpty()
  databaseUrl: string;

  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @IsString()
  @IsNotEmpty()
  directUrl: string;
}

export const env: Env = plainToInstance(Env, {
  port: process.env.SERVER_PORT,
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
  apiKey: process.env.API_KEY,
  directUrl: process.env.DIRECT_URL,
});

const errors = validateSync(env);
console.log(errors);
