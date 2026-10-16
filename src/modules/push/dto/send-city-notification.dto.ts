import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class SendCityNotificationDto {
  @IsString()
  @Length(3, 60)
  @ApiProperty()
  title: string;

  @IsString()
  @Length(3, 180)
  @ApiProperty()
  body: string;

  // Internal path only: "//host" and "/\host" would open another site in the app.
  @IsOptional()
  @IsString()
  @MaxLength(300)
  @Matches(/^\/(?![/\\])/, { message: 'url must be an internal path' })
  @ApiProperty({ required: false, example: '/chamados' })
  url?: string;
}
